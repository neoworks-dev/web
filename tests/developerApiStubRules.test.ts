import { describe, expect, it } from 'bun:test';
import type { Grant } from '@neoworks-dev/sdk';
import {
	StubError,
	handleProblem,
	isValidRedirectUri,
	normalizeGrants,
	requireMembersManagerRemains,
	requireNoEscalation,
} from './support/developerApiStubRules';
import { seedWorld } from './support/developerApiStubWorld';

const organizationWide = (permission: Grant['permission']): Grant => ({ permission, appId: null });
const forApp = (permission: Grant['permission'], appId: string): Grant => ({ permission, appId });

function errorCodeOf(action: () => void): string {
	try {
		action();
	} catch (error) {
		return (error as StubError).code;
	}
	return 'none';
}

describe('stub redirect URI rule', () => {
	it('accepts the documented forms', () => {
		expect(isValidRedirectUri('https://app.example/cb')).toBe(true);
		expect(isValidRedirectUri('http://localhost:5173/cb')).toBe(true);
		expect(isValidRedirectUri('http://127.0.0.1:8080/cb')).toBe(true);
		expect(isValidRedirectUri('com.example.app://callback')).toBe(true);
	});

	it('rejects everything else', () => {
		expect(isValidRedirectUri('http://example.com/cb')).toBe(false);
		expect(isValidRedirectUri('http://localhost/cb')).toBe(false);
		expect(isValidRedirectUri('myapp://cb')).toBe(false);
		expect(isValidRedirectUri('https://')).toBe(false);
	});
});

describe('stub handle rule', () => {
	const world = seedWorld();

	it('separates invalid, reserved and taken handles', () => {
		expect(handleProblem(world, 'A')).toBe('invalid');
		expect(handleProblem(world, '-dash')).toBe('invalid');
		expect(handleProblem(world, 'neoworks-labs')).toBe('reserved');
		expect(handleProblem(world, 'admin')).toBe('reserved');
		expect(handleProblem(world, 'acme')).toBe('taken');
		expect(handleProblem(world, 'moritz')).toBe('taken');
		expect(handleProblem(world, 'fresh-handle')).toBeNull();
	});
});

describe('stub grant rules', () => {
	it('normalizes duplicates and grants a wider one covers', () => {
		const grants = [forApp('apps.edit', 'a'), organizationWide('apps.edit'), organizationWide('apps.edit'), organizationWide('usage.view')];
		expect(normalizeGrants(grants)).toEqual([organizationWide('apps.edit'), organizationWide('usage.view')]);
	});

	it('refuses granting or removing beyond the caller reach', () => {
		const caller = [forApp('apps.edit', 'a')];
		expect(errorCodeOf(() => requireNoEscalation(caller, [], [organizationWide('apps.edit')]))).toBe('escalation');
		expect(errorCodeOf(() => requireNoEscalation(caller, [organizationWide('apps.edit')], []))).toBe('escalation');
		expect(errorCodeOf(() => requireNoEscalation(caller, [], [forApp('apps.edit', 'a')]))).toBe('none');
	});

	it('keeps at least one members manager', () => {
		const world = seedWorld();
		const globex = world.organizations.find((organization) => organization.handle === 'globex');
		if (globex === undefined) {
			throw new Error('seed lost globex');
		}
		expect(errorCodeOf(() => requireMembersManagerRemains(globex, 'user-moritz', null))).toBe('last_members_manager');
		expect(errorCodeOf(() => requireMembersManagerRemains(globex, 'user-moritz', [organizationWide('members.manage')]))).toBe('none');
		expect(errorCodeOf(() => requireMembersManagerRemains(globex, 'user-carol', null))).toBe('none');
	});
});

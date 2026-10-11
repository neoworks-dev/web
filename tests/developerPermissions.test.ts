import { describe, expect, it } from 'bun:test';
import type { Grant } from '@neoworks-dev/sdk';
import {
	ALL_PERMISSIONS,
	describeGrant,
	escalatingGrants,
	hasGrant,
	holdsPermission,
	isOrganizationWideOnly,
	matchingPreset,
	missingPermissionText,
	presetGrants,
	withGrant,
} from '../src/lib/developer/permissions';

const organizationWide = (permission: Grant['permission']): Grant => ({ permission, appId: null });
const forApp = (permission: Grant['permission'], appId: string): Grant => ({ permission, appId });

describe('holdsPermission', () => {
	it('lets an organization-wide grant cover every app', () => {
		const grants = [organizationWide('apps.edit')];
		expect(holdsPermission(grants, 'apps.edit')).toBe(true);
		expect(holdsPermission(grants, 'apps.edit', 'app-1')).toBe(true);
	});

	it('limits a per-app grant to its own app', () => {
		const grants = [forApp('apps.edit', 'app-1')];
		expect(holdsPermission(grants, 'apps.edit', 'app-1')).toBe(true);
		expect(holdsPermission(grants, 'apps.edit', 'app-2')).toBe(false);
		expect(holdsPermission(grants, 'apps.edit')).toBe(false);
	});

	it('does not mix up permissions', () => {
		expect(holdsPermission([organizationWide('usage.view')], 'apps.edit')).toBe(false);
	});
});

describe('escalatingGrants', () => {
	it('allows handing out what you hold at the same or a narrower reach', () => {
		const caller = [organizationWide('apps.edit'), forApp('usage.view', 'app-1')];
		const requested = [forApp('apps.edit', 'app-9'), organizationWide('apps.edit'), forApp('usage.view', 'app-1')];
		expect(escalatingGrants(caller, requested)).toEqual([]);
	});

	it('flags a wider reach than the caller holds', () => {
		const caller = [forApp('apps.edit', 'app-1')];
		const requested = [organizationWide('apps.edit'), forApp('apps.edit', 'app-2')];
		expect(escalatingGrants(caller, requested)).toEqual(requested);
	});

	it('flags permissions the caller does not hold at all', () => {
		expect(escalatingGrants([organizationWide('usage.view')], [organizationWide('members.manage')])).toHaveLength(1);
	});
});

describe('presets', () => {
	it('owner is every permission organization-wide', () => {
		expect(presetGrants('owner').map((grant) => grant.permission)).toEqual(ALL_PERMISSIONS);
		expect(presetGrants('owner').every((grant) => grant.appId === null)).toBe(true);
	});

	it('viewer is aggregate usage only', () => {
		expect(presetGrants('viewer')).toEqual([organizationWide('usage.view')]);
	});

	it('maintainer cannot manage members, domains or the organization', () => {
		const permissions = presetGrants('maintainer').map((grant) => grant.permission);
		expect(permissions).not.toContain('members.manage');
		expect(permissions).not.toContain('domains.manage');
		expect(permissions).not.toContain('organization.manage');
		expect(permissions).toContain('apps.edit');
	});

	it('recognises grants that equal a preset', () => {
		expect(matchingPreset(presetGrants('maintainer'))).toBe('maintainer');
		expect(matchingPreset([organizationWide('usage.view'), organizationWide('audit.view')])).toBeNull();
	});
});

describe('grant editing helpers', () => {
	it('adds and removes exactly one grant', () => {
		const grants = [organizationWide('apps.edit'), forApp('apps.edit', 'app-1')];
		const without = withGrant(grants, organizationWide('apps.edit'), false);
		expect(without).toEqual([forApp('apps.edit', 'app-1')]);
		expect(withGrant(without, organizationWide('apps.edit'), true)).toHaveLength(2);
	});

	it('does not duplicate a grant that is added twice', () => {
		const once = withGrant([], organizationWide('usage.view'), true);
		expect(withGrant(once, organizationWide('usage.view'), true)).toHaveLength(1);
	});

	it('hasGrant looks at the exact reach', () => {
		expect(hasGrant([organizationWide('apps.edit')], 'apps.edit', 'app-1')).toBe(false);
		expect(hasGrant([forApp('apps.edit', 'app-1')], 'apps.edit', 'app-1')).toBe(true);
	});
});

describe('labels', () => {
	it('knows which permissions are organization-wide only', () => {
		expect(isOrganizationWideOnly('members.manage')).toBe(true);
		expect(isOrganizationWideOnly('apps.edit')).toBe(false);
	});

	it('names the missing permission', () => {
		expect(missingPermissionText('apps.edit')).toBe('Requires the apps.edit permission');
	});

	it('describes a grant by its reach and uses the app name when known', () => {
		expect(describeGrant(organizationWide('usage.view'), {})).toBe('usage.view (organization-wide)');
		expect(describeGrant(forApp('apps.edit', 'app-1'), { 'app-1': 'Ledger' })).toBe('apps.edit (Ledger)');
		expect(describeGrant(forApp('apps.edit', 'app-2'), {})).toBe('apps.edit (app-2)');
	});
});

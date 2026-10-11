import { describe, expect, it } from 'bun:test';
import type { DeveloperApp, OwnerDomain } from '@neoworks-dev/sdk';
import { formatBytes, parseLineList, redirectUrisOffVerifiedDomains } from '../src/lib/developer/appFields';
import { fieldError, generalError } from '../src/lib/developer/formErrors';
import { reviewLabel, reviewTone } from '../src/lib/developer/status';
import { buildTodos } from '../src/lib/developer/todos';

function domain(name: string, verified: boolean): OwnerDomain {
	return { domain: name, method: 'dns', token: 'token', verified, verifiedAt: null, lastCheckedAt: null };
}

describe('parseLineList', () => {
	it('splits on lines, trims and drops blanks', () => {
		expect(parseLineList('  https://a.example/cb \n\n http://localhost:3000/cb\n  ')).toEqual([
			'https://a.example/cb',
			'http://localhost:3000/cb',
		]);
	});

	it('returns an empty list for empty text', () => {
		expect(parseLineList('')).toEqual([]);
	});
});

describe('redirectUrisOffVerifiedDomains', () => {
	const domains = [domain('acme.example', true), domain('draft.example', false)];

	it('accepts hosts on a verified domain and its subdomains', () => {
		const uris = ['https://acme.example/cb', 'https://app.acme.example/cb'];
		expect(redirectUrisOffVerifiedDomains(uris, domains)).toEqual([]);
	});

	it('flags https hosts outside verified domains, including unverified ones', () => {
		const uris = ['https://other.example/cb', 'https://draft.example/cb', 'https://notacme.example/cb'];
		expect(redirectUrisOffVerifiedDomains(uris, domains)).toEqual(uris);
	});

	it('ignores loopback and custom-scheme URIs, which no domain can verify', () => {
		const uris = ['http://localhost:3000/cb', 'http://127.0.0.1:8080/cb', 'com.acme.app://auth'];
		expect(redirectUrisOffVerifiedDomains(uris, domains)).toEqual([]);
	});
});

describe('formatBytes', () => {
	it('uses the largest fitting unit', () => {
		expect(formatBytes(512)).toBe('512 B');
		expect(formatBytes(1536)).toBe('1.5 KB');
		expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
	});
});

describe('form errors', () => {
	const failure = { formName: 'save', message: 'bad redirect', field: 'redirectUris' };

	it('shows a field error only for the failed form and field', () => {
		expect(fieldError(failure, 'save', 'redirectUris')).toBe('bad redirect');
		expect(fieldError(failure, 'save', 'name')).toBe('');
		expect(fieldError(failure, 'create', 'redirectUris')).toBe('');
		expect(fieldError(null, 'save', 'redirectUris')).toBe('');
	});

	it('shows the general message when no input handles the field', () => {
		expect(generalError(failure, 'save', ['redirectUris'])).toBe('');
		expect(generalError(failure, 'save', ['name'])).toBe('bad redirect');
		expect(generalError({ formName: 'save', message: 'oops' }, 'save', ['name'])).toBe('oops');
		expect(generalError(failure, 'other')).toBe('');
	});
});

describe('review status', () => {
	it('maps every status to a tone and label', () => {
		expect(reviewTone('approved')).toBe('green');
		expect(reviewTone('rejected')).toBe('red');
		expect(reviewLabel('pending')).toBe('In review');
		expect(reviewLabel('none')).toBe('Not submitted');
	});
});

describe('buildTodos', () => {
	function appWith(redirectUris: string[]): DeveloperApp {
		return { id: 'app-1', name: 'Planner', redirectUris } as DeveloperApp;
	}

	it('is empty when nothing needs attention', () => {
		const todos = buildTodos({
			ownerHandle: 'acme',
			receivedInvitationCount: 0,
			sentInvitationCount: 0,
			apps: [appWith(['https://acme.example/cb'])],
			domains: [domain('acme.example', true)],
			rejectedPublishes: [],
		});
		expect(todos).toEqual([]);
	});

	it('lists invitations, unverified redirect URIs and rejected publishes with links', () => {
		const todos = buildTodos({
			ownerHandle: 'acme',
			receivedInvitationCount: 2,
			sentInvitationCount: 1,
			apps: [appWith(['https://elsewhere.example/cb'])],
			domains: [],
			rejectedPublishes: [{ scope: 'acme', name: 'recipes', version: '2.0.0' }],
		});
		expect(todos.map((todo) => todo.href)).toEqual([
			'/dashboard/developer/invitations',
			'/dashboard/developer/acme/members',
			'/dashboard/developer/acme/apps/app-1',
			'/dashboard/developer/acme/schemas',
		]);
		expect(todos[3].text).toBe('@acme/recipes 2.0.0 was rejected');
	});
});

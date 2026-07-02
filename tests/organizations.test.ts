import { expect, test } from 'bun:test';
import { slugify } from '../src/lib/slug';
import { buildCreateArgs, validInvites, emptyWizardState } from '../src/lib/organizations';

test('slugify lowercases, collapses non-alphanumerics, and trims hyphens', () => {
	expect(slugify('Acme Inc.')).toBe('acme-inc');
	expect(slugify('  Hello   World!! ')).toBe('hello-world');
	expect(slugify('already-good')).toBe('already-good');
	expect(slugify('Foo_Bar 123')).toBe('foo-bar-123');
	expect(slugify('***')).toBe('');
});

test('buildCreateArgs derives slug from name when slug is blank', () => {
	const state = { ...emptyWizardState(), name: 'Acme Inc.' };
	const args = buildCreateArgs(state);
	expect(args.name).toBe('Acme Inc.');
	expect(args.slug).toBe('acme-inc');
});

test('buildCreateArgs keeps an explicit slug and drops blank optionals', () => {
	const state = { ...emptyWizardState(), name: 'Acme', slug: 'custom' };
	const args = buildCreateArgs(state);
	expect(args.slug).toBe('custom');
	expect(args.description).toBeUndefined();
	expect(args.billingEmail).toBeUndefined();
});

test('buildCreateArgs includes trimmed description and billing email when set', () => {
	const state = {
		...emptyWizardState(),
		name: 'Acme',
		description: '  builds things  ',
		billingEmail: ' pay@acme.com ',
	};
	const args = buildCreateArgs(state);
	expect(args.description).toBe('builds things');
	expect(args.billingEmail).toBe('pay@acme.com');
});

test('validInvites trims emails and drops empty rows', () => {
	const result = validInvites([
		{ email: ' a@x.com ', role: 'member' },
		{ email: '', role: 'admin' },
		{ email: '   ', role: 'owner' },
		{ email: 'b@x.com', role: 'billing' },
	]);
	expect(result).toEqual([
		{ email: 'a@x.com', role: 'member' },
		{ email: 'b@x.com', role: 'billing' },
	]);
});

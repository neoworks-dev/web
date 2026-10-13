import { describe, expect, mock, test } from 'bun:test';

// The nav data imports Svelte icon components, which bun cannot load; the icons are not under test.
for (const icon of ['StackIcon', 'SlidersHorizontalIcon', 'CodeIcon']) {
	mock.module(`phosphor-svelte/lib/${icon}`, () => ({ default: {} }));
}
const { editUrlForPath, neighboursOfPath, productForPath } = await import('../src/lib/data/docsNav');

describe('docs navigation', () => {
	test('finds the pages around a page across sections', () => {
		const { previous, next } = neighboursOfPath('/docs/neoworks/self-host');
		expect(previous?.href).toBe('/docs/neoworks');
		expect(next?.href).toBe('/docs/neoworks/oauth');
	});

	test('has no previous page at the start and no next page at the end', () => {
		expect(neighboursOfPath('/docs/neoworks').previous).toBeUndefined();
		expect(neighboursOfPath('/docs/sdk/exports').next).toBeUndefined();
	});

	test('has no neighbours for a page outside the navigation', () => {
		expect(neighboursOfPath('/docs/preview')).toEqual({});
	});

	test('resolves the product that owns a path', () => {
		expect(productForPath('/docs/sdk/errors').id).toBe('sdk');
	});

	test('links to the markdown source of a page', () => {
		expect(editUrlForPath('/docs/sdk/errors')).toBe(
			'https://github.com/neoworks-dev/web/edit/main/src/routes/(public)/docs/sdk/errors/+page.svx'
		);
	});
});

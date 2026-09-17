import { describe, expect, it } from 'bun:test';
import { reroute } from '../src/hooks';

function rerouteFor(href: string) {
	return reroute({ url: new URL(href), fetch: globalThis.fetch });
}

describe('reroute', () => {
	it('leaves the main domain alone', () => {
		expect(rerouteFor('https://neoworks.dev/')).toBeUndefined();
		expect(rerouteFor('https://neoworks.dev/pricing')).toBeUndefined();
	});

	it('maps the latent host root onto the /latent page', () => {
		expect(rerouteFor('https://latent.neoworks.dev/')).toBe('/latent');
	});

	it('prefixes deeper paths on the latent host', () => {
		expect(rerouteFor('https://latent.neoworks.dev/changelog')).toBe('/latent/changelog');
	});

	it('does not prefix twice when the path already points at the subtree', () => {
		expect(rerouteFor('https://latent.neoworks.dev/latent')).toBeUndefined();
	});

	it('works on the dev base domain', () => {
		expect(rerouteFor('https://latent.neoworks.localhost/')).toBe('/latent');
	});

	it('does not match a domain that merely contains the name', () => {
		expect(rerouteFor('https://notlatent.neoworks.dev/')).toBeUndefined();
	});
});

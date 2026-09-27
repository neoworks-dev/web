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

	it('maps the feature pages onto the /latent subtree', () => {
		expect(rerouteFor('https://latent.neoworks.dev/sky-replacement')).toBe(
			'/latent/sky-replacement'
		);
		expect(rerouteFor('https://latent.neoworks.dev/automatic-masking')).toBe(
			'/latent/automatic-masking'
		);
		expect(rerouteFor('https://latent.neoworks.dev/light-reframing')).toBe(
			'/latent/light-reframing'
		);
	});

	it('works on the dev base domain', () => {
		expect(rerouteFor('https://latent.neoworks.localhost/')).toBe('/latent');
	});

	it('lets main-site paths through on the latent host', () => {
		expect(rerouteFor('https://latent.neoworks.dev/docs/latent')).toBeUndefined();
		expect(rerouteFor('https://latent.neoworks.dev/auth/login')).toBeUndefined();
		expect(rerouteFor('https://latent.neoworks.dev/pricing')).toBeUndefined();
	});

	it('does not match a domain that merely contains the name', () => {
		expect(rerouteFor('https://notlatent.neoworks.dev/')).toBeUndefined();
		expect(rerouteFor('https://notvitals.neoworks.dev/')).toBeUndefined();
	});

	it('maps the vitals host root onto the /dev/vitals page', () => {
		expect(rerouteFor('https://vitals.neoworks.dev/')).toBe('/dev/vitals');
		expect(rerouteFor('https://vitals.neoworks.localhost/')).toBe('/dev/vitals');
	});

	it('lets main-site paths through on the vitals host', () => {
		expect(rerouteFor('https://vitals.neoworks.dev/pricing')).toBeUndefined();
		expect(rerouteFor('https://vitals.neoworks.dev/auth/login')).toBeUndefined();
	});
});

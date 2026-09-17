const repository = 'neoworks-dev/latent';

/** Release and source links for the Latent desktop editor. */
export const latent = {
	sourceUrl: `https://github.com/${repository}`,
	releasesUrl: `https://github.com/${repository}/releases/latest`,
	appImageUrl: `https://github.com/${repository}/releases/latest/download/Latent-x86_64.AppImage`
};

export type LatentFeature = {
	/** Path within the Latent site, without the `/latent` prefix. */
	path: string;
	label: string;
};

export const latentFeatures: LatentFeature[] = [
	{ path: '/sky-replacement', label: 'Sky replacement' },
	{ path: '/automatic-masking', label: 'Automatic masking' },
	{ path: '/light-reframing', label: 'Light reframing' }
];

/**
 * A link between Latent pages. The site is reachable two ways — as
 * `latent.<base-domain>/x` and as `<base-domain>/latent/x` — so the prefix
 * depends on which host the visitor is on.
 */
export function latentHref(hostname: string, path: string): string {
	if (hostname.startsWith('latent.')) return orRoot(path);
	return `/latent${path}`;
}

function orRoot(path: string): string {
	if (path) return path;
	return '/';
}

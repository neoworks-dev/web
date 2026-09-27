import type { Reroute } from '@sveltejs/kit';

/**
 * Paths the Latent site owns on `latent.<base-domain>`. Everything else — docs,
 * pricing, the auth routes — falls through unchanged, so the shared NeoWorks
 * header works the same on that host as on the main domain.
 */
const latentRoutes: Record<string, string> = {
	'/': '/latent',
	'/sky-replacement': '/latent/sky-replacement',
	'/automatic-masking': '/latent/automatic-masking',
	'/light-reframing': '/latent/light-reframing'
};

/** Paths the Vitals site owns on `vitals.<base-domain>`. */
const vitalsRoutes: Record<string, string> = {
	'/': '/dev/vitals'
};

/**
 * Universal hook — it runs for SSR and for client-side navigation, so the same
 * mapping applies to in-page links.
 */
export const reroute: Reroute = ({ url }) => {
	if (url.hostname.startsWith('latent.')) return latentRoutes[url.pathname];
	if (url.hostname.startsWith('vitals.')) return vitalsRoutes[url.pathname];
};

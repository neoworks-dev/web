import type { Reroute } from '@sveltejs/kit';

/**
 * Paths the Latent site owns on `latent.<base-domain>`. Everything else — docs,
 * pricing, the auth routes — falls through unchanged, so the shared NeoWorks
 * header works the same on that host as on the main domain.
 */
const latentRoutes: Record<string, string> = {
	'/': '/latent'
};

/**
 * Universal hook — it runs for SSR and for client-side navigation, so the same
 * mapping applies to in-page links.
 */
export const reroute: Reroute = ({ url }) => {
	if (!url.hostname.startsWith('latent.')) return;
	return latentRoutes[url.pathname];
};

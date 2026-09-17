import type { Reroute } from '@sveltejs/kit';

/**
 * `latent.<base-domain>` is served by this same app: requests to that host are
 * mapped onto the `/latent` subtree, so the product site keeps root-level paths
 * on its own domain while `/latent` stays reachable on the main domain.
 *
 * Universal hook — it runs for SSR and for client-side navigation, so in-page
 * links can use plain paths like `/features` on the latent host.
 */
export const reroute: Reroute = ({ url }) => {
	if (!url.hostname.startsWith('latent.')) return;
	if (url.pathname.startsWith('/latent')) return;
	if (url.pathname === '/') return '/latent';
	return `/latent${url.pathname}`;
};

import type { LayoutLoad } from './$types';

// The product site is public marketing: it needs crawlable HTML and real head
// tags, so it opts back into the server rendering the root layout turns off.
export const ssr = true;

export const load: LayoutLoad = ({ data }) => ({
	...data,
	meta: {
		title: 'Latent — RAW editing that stays on your machine',
		description:
			'A non-destructive RAW editor: masks, curves and a history you can walk back. Free, open source, and your photos never leave your disk.',
		themeColor: '#08090a'
	}
});

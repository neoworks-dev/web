import type { PageLoad } from './$types';

export const load: PageLoad = () => ({
	meta: {
		title: 'Automatic masking — Latent',
		description:
			'Select the subject, the sky, or whatever you point at, and get back an ordinary mask layer you can feather, combine and hang adjustments off.'
	}
});

import type { PageLoad } from './$types';

export const load: PageLoad = () => ({
	meta: {
		title: 'Sky replacement — Latent',
		description:
			'Latent finds the sky in a frame, swaps it, and matches the light underneath it — as an ordinary mask layer you can still take apart.'
	}
});

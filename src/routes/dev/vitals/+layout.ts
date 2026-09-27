import type { LayoutLoad } from './$types';

// The product site is public marketing: it needs crawlable HTML and real head
// tags, so it opts back into the server rendering the root layout turns off.
export const ssr = true;

// A universal load replaces the server load's output rather than merging with
// it, so the session has to be carried through explicitly or the header renders
// signed out on this host.
export const load: LayoutLoad = async ({ data }) => ({
	...data,
	meta: {
		title: 'Vitals — code intelligence for coding agents',
		description:
			'One engine, five answers, no model in the loop: map, search, explore, rename and impact for an AI coding agent. Compiler-backed, file:line on every claim, nothing written into your repo.',
		themeColor: '#08090a'
	}
});

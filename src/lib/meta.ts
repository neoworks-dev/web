/**
 * Document metadata for a route. A route supplies the fields it cares about via
 * `meta` on its load data; the root layout merges them over the site defaults and
 * renders the single set of head tags.
 */
export interface PageMeta {
	title?: string;
	description?: string;
	ogImage?: string;
	twitterCard?: string;
	twitterSite?: string;
	themeColor?: string;
	icon?: string;
}

export type ResolvedMeta = Required<PageMeta>;

export const defaultMeta: ResolvedMeta = {
	title: 'NeoWorks — Your data, your rules',
	description: 'A personal cloud built on ownership, not surveillance. One identity.',
	ogImage: '/og-default.png',
	twitterCard: 'summary_large_image',
	twitterSite: '@neoworks',
	themeColor: '#040906',
	icon: '/favicon.svg'
};

export function resolveMeta(routeMeta: PageMeta | undefined): ResolvedMeta {
	if (!routeMeta) return defaultMeta;
	return { ...defaultMeta, ...withoutUnsetFields(routeMeta) };
}

/** Keeps an explicit `undefined` from erasing a default during the merge. */
function withoutUnsetFields(meta: PageMeta): PageMeta {
	const setFields = Object.entries(meta).filter(([, value]) => value !== undefined);
	return Object.fromEntries(setFields);
}

import type { Component } from 'svelte';
import StackIcon from 'phosphor-svelte/lib/StackIcon';
import PaintBrushIcon from 'phosphor-svelte/lib/PaintBrushIcon';
import SlidersHorizontalIcon from 'phosphor-svelte/lib/SlidersHorizontalIcon';
import CodeIcon from 'phosphor-svelte/lib/CodeIcon';

export type DocLink = {
	label: string;
	href: string;
};

export type DocSection = {
	title: string;
	links: DocLink[];
};

// A documented product. Its docs live under `basePath`; the docs header shows one
// tab per product, and the sidebar renders the active product's `sections`.
export type DocProduct = {
	id: string;
	label: string;
	tagline: string;
	href: string;
	basePath: string;
	accent: string;
	icon: Component;
	sections: DocSection[];
};

export const docProducts: DocProduct[] = [
	{
		id: 'neoworks',
		label: 'NeoWorks',
		tagline: 'Platform & API',
		href: '/docs/neoworks',
		basePath: '/docs/neoworks',
		accent: '#60a5fa',
		icon: StackIcon,
		sections: [
			{
				title: 'Getting started',
				links: [
					{ label: 'Introduction', href: '/docs/neoworks' },
					{ label: 'Quickstart', href: '/docs/neoworks/quickstart' },
					{ label: 'Self-hosting', href: '/docs/neoworks/self-host' }
				]
			},
			{
				title: 'Platform',
				links: [
					{ label: 'OAuth', href: '/docs/neoworks/oauth' },
					{ label: 'File & media storage', href: '/docs/neoworks/storage' },
					{ label: 'Encryption model', href: '/docs/neoworks/encryption' },
					{ label: 'Spaces', href: '/docs/neoworks/spaces' },
					{ label: 'Searchable encrypted media', href: '/docs/neoworks/encrypted-search' },
					{ label: 'Devices', href: '/docs/neoworks/devices' }
				]
			},
			{
				title: 'Schemas',
				links: [
					{ label: 'OpenSchema', href: '/docs/neoworks/openschema' },
					{ label: 'Contacts', href: '/docs/neoworks/openschema/contacts' },
					{ label: 'Calendar', href: '/docs/neoworks/openschema/events' },
					{ label: 'Tasks', href: '/docs/neoworks/openschema/tasks' }
				]
			}
		]
	},
	{
		id: 'muse',
		label: 'Muse',
		tagline: 'Infinite canvas',
		href: '/docs/muse',
		basePath: '/docs/muse',
		accent: '#f472b6',
		icon: PaintBrushIcon,
		sections: [
			{
				title: 'Muse',
				links: [
					{ label: 'Introduction', href: '/docs/muse' },
					{ label: 'Canvas', href: '/docs/muse/canvas' },
					{ label: 'Folders', href: '/docs/muse/folder' },
					{ label: 'Sync & data', href: '/docs/muse/sync' }
				]
			}
		]
	},
	{
		id: 'latent',
		label: 'Latent',
		tagline: 'RAW photo editor',
		href: '/docs/latent',
		basePath: '/docs/latent',
		accent: '#f87171',
		icon: SlidersHorizontalIcon,
		sections: [
			{
				title: 'Getting started',
				links: [
					{ label: 'Introduction', href: '/docs/latent' },
					{ label: 'Install', href: '/docs/latent/install' }
				]
			},
			{
				title: 'Editing',
				links: [
					{ label: 'Library & culling', href: '/docs/latent/library' },
					{ label: 'Develop', href: '/docs/latent/develop' },
					{ label: 'Masks & layers', href: '/docs/latent/masks' },
					{ label: 'Presets & history', href: '/docs/latent/presets' }
				]
			},
			{
				title: 'Under the hood',
				links: [{ label: 'Files & sidecars', href: '/docs/latent/files' }]
			}
		]
	},
	{
		id: 'api',
		label: 'API',
		tagline: 'Reference & internals',
		href: '/docs/api',
		basePath: '/docs/api',
		accent: '#34d399',
		icon: CodeIcon,
		sections: [
			{
				title: 'Getting started',
				links: [
					{ label: 'Overview', href: '/docs/api' },
					{ label: 'Development', href: '/docs/api/development' }
				]
			},
			{
				title: 'Concepts',
				links: [
					{ label: 'Architecture', href: '/docs/api/architecture' },
					{ label: 'Data model', href: '/docs/api/data-model' },
					{ label: 'Entity surface', href: '/docs/api/entity-surface' }
				]
			},
			{
				title: 'Reference',
				links: [
					{ label: 'HTTP API', href: '/docs/api/http-api' },
					{ label: 'GraphQL API', href: '/docs/api/graphql-api' },
					{ label: 'OAuth', href: '/docs/api/oauth' }
				]
			}
		]
	}
];

// Resolve the active product from a pathname (longest matching basePath wins).
export function productForPath(pathname: string): DocProduct {
	const match = [...docProducts]
		.sort((a, b) => b.basePath.length - a.basePath.length)
		.find((product) => pathname === product.basePath || pathname.startsWith(product.basePath + '/'));
	return match ?? docProducts[0];
}

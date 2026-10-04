import type { Component } from 'svelte';
import StackIcon from 'phosphor-svelte/lib/StackIcon';
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
					{ label: 'Self-hosting', href: '/docs/neoworks/self-host' }
				]
			},
			{
				title: 'Platform',
				links: [
					{ label: 'OAuth', href: '/docs/neoworks/oauth' },
					{ label: 'Encryption model', href: '/docs/neoworks/encryption' },
					{ label: 'Sharing', href: '/docs/neoworks/sharing' },
					{ label: 'Devices', href: '/docs/neoworks/devices' }
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
	}
];

// Resolve the active product from a pathname (longest matching basePath wins).
export function productForPath(pathname: string): DocProduct {
	const match = [...docProducts]
		.sort((a, b) => b.basePath.length - a.basePath.length)
		.find((product) => pathname === product.basePath || pathname.startsWith(product.basePath + '/'));
	return match ?? docProducts[0];
}

import type { Component } from 'svelte';

import { appUrl } from '$lib/urls';
import ImagesIcon from 'phosphor-svelte/lib/ImagesIcon';
import FolderIcon from 'phosphor-svelte/lib/FolderIcon';
import CalendarBlankIcon from 'phosphor-svelte/lib/CalendarBlankIcon';
import AddressBookIcon from 'phosphor-svelte/lib/AddressBookIcon';
import EnvelopeSimpleIcon from 'phosphor-svelte/lib/EnvelopeSimpleIcon';
import SlidersHorizontalIcon from 'phosphor-svelte/lib/SlidersHorizontalIcon';
import BookOpenIcon from 'phosphor-svelte/lib/BookOpenIcon';
import TreeStructureIcon from 'phosphor-svelte/lib/TreeStructureIcon';
import KeyIcon from 'phosphor-svelte/lib/KeyIcon';
import HardDrivesIcon from 'phosphor-svelte/lib/HardDrivesIcon';
import CodeIcon from 'phosphor-svelte/lib/CodeIcon';

export type NavProject = {
	name: string;
	tagline: string;
	icon: Component;
	/** Absent while the project has no page to link to; it is listed as coming soon. */
	href?: string;
	external?: boolean;
};

export const everydayApps: NavProject[] = [
	{ name: 'Photos', tagline: 'Your library, encrypted', icon: ImagesIcon, href: appUrl('photos'), external: true },
	{ name: 'Drive', tagline: 'Files and folders', icon: FolderIcon },
	{ name: 'Calendar', tagline: 'Events and the people in them', icon: CalendarBlankIcon, href: appUrl('calendar'), external: true },
	{ name: 'Contacts', tagline: 'Everyone you know', icon: AddressBookIcon, href: appUrl('contacts'), external: true },
	{ name: 'Mail', tagline: 'For the address you already have', icon: EnvelopeSimpleIcon },
	{ name: 'Latent', tagline: 'RAW photo editor', icon: SlidersHorizontalIcon, href: appUrl('latent'), external: true }
];

export const developerTools: NavProject[] = [
	{ name: 'Docs', tagline: 'Guides and reference', icon: BookOpenIcon, href: '/docs/neoworks' },
	{ name: 'OpenSchema', tagline: 'Shared data contracts', icon: TreeStructureIcon, href: appUrl('openschema'), external: true },
	{ name: 'OAuth guide', tagline: 'Sign users in with Neoworks', icon: KeyIcon, href: '/docs/neoworks/oauth' },
	{ name: 'Self-hosting', tagline: 'Run your own node', icon: HardDrivesIcon, href: '/docs/neoworks/self-host' },
	{ name: 'Code editor', tagline: 'Write code in the browser', icon: CodeIcon }
];

export type NavFeature = {
	title: string;
	body: string;
	href: string;
	/** Background photo; without one the card is filled with the brand colour. */
	image?: string;
};

export const everydayAppsFeature: NavFeature = {
	title: 'Bring your things over',
	body: 'Photos, files, calendar and contacts, encrypted on your device.',
	href: '/auth/signup',
	image: '/hero/8445576.jpg'
};

export const developerToolsFeature: NavFeature = {
	title: 'Build on Neoworks',
	body: "Store your users' data in their own encrypted accounts instead of your database.",
	href: '/docs/neoworks'
};

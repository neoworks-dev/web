import type { Component } from 'svelte';

import { appUrl } from '$lib/urls';
import TreeStructureIcon from 'phosphor-svelte/lib/TreeStructureIcon';
import PaintBrushIcon from 'phosphor-svelte/lib/PaintBrushIcon';
import SlidersHorizontalIcon from 'phosphor-svelte/lib/SlidersHorizontalIcon';
import MapTrifoldIcon from 'phosphor-svelte/lib/MapTrifoldIcon';
import ChatCircleIcon from 'phosphor-svelte/lib/ChatCircleIcon';
import CodeIcon from 'phosphor-svelte/lib/CodeIcon';
import RocketLaunchIcon from 'phosphor-svelte/lib/RocketLaunchIcon';
import CoinsIcon from 'phosphor-svelte/lib/CoinsIcon';
import AddressBookIcon from 'phosphor-svelte/lib/AddressBookIcon';
import CalendarBlankIcon from 'phosphor-svelte/lib/CalendarBlankIcon';
import CheckSquareIcon from 'phosphor-svelte/lib/CheckSquareIcon';
import BracketsCurlyIcon from 'phosphor-svelte/lib/BracketsCurlyIcon';
import BlueprintIcon from 'phosphor-svelte/lib/BlueprintIcon';
import DatabaseIcon from 'phosphor-svelte/lib/DatabaseIcon';
import GraphIcon from 'phosphor-svelte/lib/GraphIcon';
import GlobeIcon from 'phosphor-svelte/lib/GlobeIcon';
import ShieldCheckIcon from 'phosphor-svelte/lib/ShieldCheckIcon';
import StackIcon from 'phosphor-svelte/lib/StackIcon';
import HardDrivesIcon from 'phosphor-svelte/lib/HardDrivesIcon';
import PulseIcon from 'phosphor-svelte/lib/PulseIcon';

export type Project = {
	name: string;
	tagline: string;
	href: string;
	/** Hex accent — app-accent tokens are not defined in the live stylesheet, so colors are applied inline. */
	accent: string;
	icon: Component;
	external?: boolean;
};

export type ProjectColumn = {
	heading: string;
	items: Project[];
};

/** A spotlighted flagship rendered as a large gradient feature card. */
export type Flagship = {
	name: string;
	blurb: string;
	href: string;
	accent: string;
	/** Explicit CSS gradient so brand colors stay centralized, not scattered in markup. */
	gradient: string;
	icon: Component;
	external?: boolean;
	badge?: string;
};

// The real, shipped flagships we want to advertise — rendered as gradient feature cards.
export const flagships: Flagship[] = [
	{
		name: 'OpenSchema',
		blurb: 'Shared data contracts every app speaks. Build once, interoperate with the whole ecosystem.',
		href: appUrl('openschema'),
		accent: '#60a5fa',
		gradient: 'linear-gradient(135deg, #2a6e78 0%, #2c4a86 55%, #161d38 100%)',
		icon: TreeStructureIcon,
		external: true
	},
	{
		name: 'Muse',
		blurb: 'Infinite canvas studio for thinking visually — sync, media and collaboration built in.',
		href: appUrl('muse'),
		accent: '#f472b6',
		gradient: 'linear-gradient(135deg, #5b4d86 0%, #3a2f5e 50%, #100d18 100%)',
		icon: PaintBrushIcon,
		external: true
	},
	{
		name: 'Maps',
		blurb: 'Privacy-first maps, routing and live navigation. Your trips stay your data.',
		href: appUrl('maps'),
		accent: '#22d3ee',
		gradient: 'linear-gradient(135deg, #2a7387 0%, #1c4d61 50%, #0e2230 100%)',
		icon: MapTrifoldIcon,
		external: true
	},
	{
		name: 'Latent',
		blurb: 'Non-destructive RAW photo editor for the desktop. Free, open source, runs on your machine.',
		href: appUrl('latent'),
		accent: '#f87171',
		gradient: 'linear-gradient(135deg, #7d3f3f 0%, #4a2530 50%, #170e12 100%)',
		icon: SlidersHorizontalIcon,
		external: true
	},
	{
		name: 'Chat',
		blurb: 'Signal-grade encrypted messaging, end-to-end, on your own account.',
		href: appUrl('chat-relay'),
		accent: '#4ade80',
		gradient: 'linear-gradient(135deg, #2f7d64 0%, #1c4d3b 50%, #0b1813 100%)',
		icon: ChatCircleIcon,
		external: true
	}
];

// Quick links shown beside the flagship cards in the Projects mega menu.
export const projectQuickLinks: Project[] = [
	{ name: 'Pricing', tagline: 'One €2 subscription', href: '/pricing', accent: '#a3e635', icon: CoinsIcon },
	{ name: 'All apps', tagline: 'The full ecosystem', href: '/#apps', accent: '#60a5fa', icon: StackIcon },
	{ name: 'Docs', tagline: 'Guides & reference', href: '/docs', accent: '#22d3ee', icon: BracketsCurlyIcon },
	{ name: 'Latent docs', tagline: 'RAW photo editor', href: '/docs/latent', accent: '#f87171', icon: SlidersHorizontalIcon },
	{ name: 'Self-host', tagline: 'Run your own node', href: '/docs/neoworks/self-host', accent: '#fb923c', icon: HardDrivesIcon }
];

const DEV_ACCENT = '#60a5fa';

// Grouped link columns for the separate Developers mega menu.
export const developerMenu: ProjectColumn[] = [
	{
		heading: 'Build',
		items: [
			{ name: 'Developers', tagline: 'Build & earn', href: '/developers', accent: DEV_ACCENT, icon: CodeIcon },
			{ name: 'Quickstart', tagline: 'Zero to shipping', href: '/docs/neoworks/quickstart', accent: DEV_ACCENT, icon: RocketLaunchIcon },
			{ name: 'Revenue model', tagline: 'Get paid for good software', href: '/developers#revenue', accent: DEV_ACCENT, icon: CoinsIcon },
			{ name: 'Vitals', tagline: 'Code intelligence for agents', href: '/dev/vitals', accent: DEV_ACCENT, icon: PulseIcon }
		]
	},
	{
		heading: 'OpenSchema',
		items: [
			{ name: 'Overview', tagline: 'Shared data contracts', href: '/docs/neoworks/openschema', accent: DEV_ACCENT, icon: TreeStructureIcon },
			{ name: 'Contacts', tagline: 'Schema', href: '/docs/neoworks/openschema/contacts', accent: DEV_ACCENT, icon: AddressBookIcon },
			{ name: 'Events', tagline: 'Schema', href: '/docs/neoworks/openschema/events', accent: DEV_ACCENT, icon: CalendarBlankIcon },
			{ name: 'Tasks', tagline: 'Schema', href: '/docs/neoworks/openschema/tasks', accent: DEV_ACCENT, icon: CheckSquareIcon }
		]
	},
	{
		heading: 'API reference',
		items: [
			{ name: 'Overview', tagline: 'Endpoints & SDKs', href: '/docs/api/development', accent: DEV_ACCENT, icon: BracketsCurlyIcon },
			{ name: 'Architecture', tagline: 'How it fits together', href: '/docs/api/architecture', accent: DEV_ACCENT, icon: BlueprintIcon },
			{ name: 'Data model', tagline: 'Entities & records', href: '/docs/api/data-model', accent: DEV_ACCENT, icon: DatabaseIcon },
			{ name: 'GraphQL API', tagline: 'Typed data plane', href: '/docs/api/graphql-api', accent: DEV_ACCENT, icon: GraphIcon },
			{ name: 'HTTP API', tagline: 'REST surface', href: '/docs/api/http-api', accent: DEV_ACCENT, icon: GlobeIcon },
			{ name: 'OAuth', tagline: 'Scopes & tokens', href: '/docs/api/oauth', accent: DEV_ACCENT, icon: ShieldCheckIcon }
		]
	}
];

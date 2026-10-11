<script lang="ts">
	import {
		AppWindow,
		Buildings,
		Database,
		EnvelopeSimple,
		Gear,
		SealCheck,
		Globe,
		House,
		ListChecks,
		PlugsConnected,
		SlidersHorizontal,
		ShieldCheck,
		SquaresFour,
		UsersThree,
	} from 'phosphor-svelte';
	import type { DeveloperContext } from '$lib/server/developerContext';
	import OwnerSwitcher from '$lib/components/developer/OwnerSwitcher.svelte';
	import { page } from '$app/stores';
	import { overlayScroll } from '$lib/actions/overlayScroll';
	import { urls } from '$lib/urls';
	import SidebarShell from './SidebarShell.svelte';

	interface User {
		email: string;
		name?: string;
		sub?: string;
	}

	let {
		user,
		developer = null,
		collapsed = $bindable(false),
		mobileOpen = $bindable(false),
	}: { user: User; developer?: DeveloperContext | null; collapsed: boolean; mobileOpen?: boolean } = $props();

	type NavItem = { href: string; label: string; Icon: any; badge?: number };
	type NavGroup = { label: string | null; items: NavItem[] };

	const currentOwner = $derived.by(() => {
		if (developer === null || developer.handle === null) {
			return null;
		}
		const routeOwner = $page.params.owner;
		const routed = developer.owners.find((entry) => entry.owner.handle === routeOwner);
		if (routed !== undefined) {
			return routed;
		}
		return developer.owners[0];
	});

	function organizationItems(base: string): NavItem[] {
		return [
			{ href: base, label: 'Overview', Icon: SquaresFour },
			{ href: `${base}/apps`, label: 'Apps', Icon: AppWindow },
			{ href: `${base}/schemas`, label: 'Schemas', Icon: Database },
			{ href: `${base}/members`, label: 'Members', Icon: UsersThree },
			{ href: `${base}/domains`, label: 'Domains', Icon: Globe },
			{ href: `${base}/audit`, label: 'Audit log', Icon: ListChecks },
			{ href: `${base}/settings`, label: 'Organization settings', Icon: Gear },
		];
	}

	function personalItems(base: string): NavItem[] {
		return [
			{ href: base, label: 'Overview', Icon: SquaresFour },
			{ href: `${base}/apps`, label: 'Apps', Icon: AppWindow },
			{ href: `${base}/schemas`, label: 'Schemas', Icon: Database },
			{ href: `${base}/domains`, label: 'Domains', Icon: Globe },
			{ href: '/dashboard/developer/invitations', label: 'Invitations', Icon: EnvelopeSimple },
			{ href: '/dashboard/developer/organizations/new', label: 'New organization', Icon: Buildings },
		];
	}

	function developerItems(): NavItem[] {
		if (developer === null) {
			return [];
		}
		if (currentOwner === null || currentOwner === undefined) {
			return [{ href: '/dashboard/developer/handle', label: 'Pick a handle', Icon: SquaresFour }];
		}
		const base = `/dashboard/developer/${currentOwner.owner.handle}`;
		if (currentOwner.owner.kind === 'organization') {
			return organizationItems(base);
		}
		return personalItems(base);
	}

	function platformItems(): NavItem[] {
		if (developer === null || !developer.admin) {
			return [];
		}
		return [{ href: '/dashboard/admin/reviews', label: 'App reviews', Icon: SealCheck }];
	}

	const groups: NavGroup[] = $derived([
		{
			label: null,
			items: [
				{ href: '/dashboard', label: 'Home', Icon: House },
			],
		},
		{ label: 'Developer', items: developerItems() },
		{ label: 'Platform', items: platformItems() },
		{
			label: 'Access',
			items: [
				{ href: '/dashboard/connected-apps',     label: 'Connected Apps',     Icon: PlugsConnected },
			],
		},
		{
			label: 'Settings',
			items: [
				{ href: '/dashboard/preferences',  label: 'Preferences',   Icon: SlidersHorizontal },
				{ href: `${urls.oauth}/account/security`, label: 'Security & Devices', Icon: ShieldCheck },
			],
		},
	].filter((group) => group.items.length > 0));

	function isActive(href: string): boolean {
		if (href === '/dashboard') return $page.url.pathname === '/dashboard';
		if (/^\/dashboard\/developer\/[^/]+$/.test(href)) return $page.url.pathname === href;
		return $page.url.pathname.startsWith(href);
	}
</script>

<SidebarShell {user} bind:collapsed bind:mobileOpen>
		<nav
			use:overlayScroll
			class="relative flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 flex flex-col gap-0.5"
		>
			{#if developer && currentOwner}
				<OwnerSwitcher owners={developer.owners} currentHandle={currentOwner.owner.handle} {collapsed} />
			{/if}

			{#each groups as group, gi}
				{#if group.label && !collapsed}
					<div class="flex items-center h-7 px-2 mt-2 mb-px">
						<span class="font-mono text-[11px] text-dim uppercase tracking-caps whitespace-nowrap">
							{group.label}
						</span>
					</div>
				{/if}

				{#each group.items as { href, label, Icon, badge }}
					{@const active = isActive(href)}
					<a
						{href}
						title={collapsed ? label : undefined}
						onclick={() => (mobileOpen = false)}
						class="flex items-center gap-2 h-9 px-2 rounded-md text-[13px] font-medium transition-colors duration-fast
								{active ? 'bg-raised text-default' : 'text-muted hover:bg-hover hover:text-default'}"
						class:justify-center={collapsed}
					>
						<span class="flex shrink-0 w-5 h-5 items-center justify-center">
							<Icon size={17} weight={active ? 'fill' : 'regular'} />
						</span>
						{#if !collapsed}
							<span class="flex-1 whitespace-nowrap overflow-hidden">{label}</span>
							{#if badge != null}
								<span class="font-mono text-[10px] text-dim bg-raised border border-line-faint rounded-full px-4 h-5 flex items-center shrink-0">
									{badge}
								</span>
							{/if}
						{/if}
					</a>
				{/each}

				{#if gi < groups.length - 1}
					<div class="h-px bg-line-faint my-2 mx-2"></div>
				{/if}
			{/each}
		</nav>
</SidebarShell>

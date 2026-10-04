<script lang="ts">
	import {
		House,
		PlugsConnected,
		SlidersHorizontal,
		ShieldCheck,
	} from 'phosphor-svelte';
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
		collapsed = $bindable(false),
		mobileOpen = $bindable(false),
	}: { user: User; collapsed: boolean; mobileOpen?: boolean } = $props();

	const groups: Array<{
		label: string | null;
		items: Array<{ href: string; label: string; Icon: any; badge?: number }>;
	}> = [
		{
			label: null,
			items: [
				{ href: '/dashboard', label: 'Home', Icon: House },
			],
		},
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
	];

	function isActive(href: string): boolean {
		if (href === '/dashboard') return $page.url.pathname === '/dashboard';
		return $page.url.pathname.startsWith(href);
	}
</script>

<SidebarShell {user} bind:collapsed bind:mobileOpen>
		<nav
			use:overlayScroll
			class="relative flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 flex flex-col gap-0.5"
		>
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

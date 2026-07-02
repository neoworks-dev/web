<script lang="ts">
	import { page } from '$app/stores';
	import UsersThreeIcon from 'phosphor-svelte/lib/UsersThreeIcon';
	import KeyIcon from 'phosphor-svelte/lib/KeyIcon';
	import SlidersHorizontalIcon from 'phosphor-svelte/lib/SlidersHorizontalIcon';

	let {
		orgId,
		orgName,
		logoUrl,
	}: { orgId: string; orgName: string; logoUrl?: string | null } = $props();

	const items = $derived([
		{ href: `/dashboard/organizations/${orgId}/clients`, label: 'Clients', Icon: KeyIcon },
		{ href: `/dashboard/organizations/${orgId}/members`, label: 'Members', Icon: UsersThreeIcon },
		{ href: `/dashboard/organizations/${orgId}/settings`, label: 'Settings', Icon: SlidersHorizontalIcon },
	]);

	function initials(name: string): string {
		return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
	}

	function isActive(href: string): boolean {
		return $page.url.pathname.startsWith(href);
	}
</script>

<div class="flex flex-col h-full">
	<!-- Org header -->
	<div class="flex items-center gap-2.5 px-3 py-3 border-b border-line-faint shrink-0">
		{#if logoUrl}
			<img src={logoUrl} alt={orgName} class="w-8 h-8 rounded-lg object-cover border border-line-faint shrink-0" />
		{:else}
			<div class="w-8 h-8 rounded-lg bg-raised border border-line-faint flex items-center justify-center text-[11px] font-semibold text-muted shrink-0">
				{initials(orgName)}
			</div>
		{/if}
		<p class="text-[13px] font-medium text-default truncate">{orgName}</p>
	</div>

	<!-- Org nav -->
	<nav class="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-0.5">
		{#each items as { href, label, Icon } (href)}
			{@const active = isActive(href)}
			<a
				{href}
				class="flex items-center gap-2 h-9 px-2 rounded-md text-[13px] font-medium transition-colors duration-fast
					{active ? 'bg-raised text-default' : 'text-muted hover:bg-hover hover:text-default'}"
			>
				<span class="flex shrink-0 w-5 h-5 items-center justify-center">
					<Icon size={17} weight={active ? 'fill' : 'regular'} />
				</span>
				{label}
			</a>
		{/each}
	</nav>
</div>

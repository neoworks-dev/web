<script lang="ts">
	import { page } from '$app/stores';
	import ArrowLeftIcon from 'phosphor-svelte/lib/ArrowLeftIcon';
	import SquaresFourIcon from 'phosphor-svelte/lib/SquaresFourIcon';
	import DatabaseIcon from 'phosphor-svelte/lib/DatabaseIcon';
	import RocketLaunchIcon from 'phosphor-svelte/lib/RocketLaunchIcon';
	import StackIcon from 'phosphor-svelte/lib/StackIcon';

	let {
		orgId,
		clientId,
		collapsed = false,
	}: { orgId: string; clientId: string; collapsed?: boolean } = $props();

	const base = $derived(`/dashboard/organizations/${orgId}/clients/${clientId}`);
	const clientsHref = $derived(`/dashboard/organizations/${orgId}/clients`);

	const items = $derived([
		{ href: base,                  label: 'Overview',     Icon: SquaresFourIcon },
		{ href: `${base}/databases`,   label: 'Databases',    Icon: DatabaseIcon },
		{ href: `${base}/deployments`, label: 'Deployments',  Icon: RocketLaunchIcon },
		{ href: `${base}/environments`, label: 'Environments', Icon: StackIcon },
	]);

	function isActive(href: string): boolean {
		if (href === base) return $page.url.pathname === base;
		return $page.url.pathname.startsWith(href);
	}
</script>

<!-- Back to the org's client list -->
<a
	href={clientsHref}
	title={collapsed ? 'All clients' : undefined}
	class="flex items-center gap-2 h-9 px-3 mx-2 mt-2 rounded-md text-[13px] text-muted hover:bg-hover hover:text-default transition-colors"
	class:justify-center={collapsed}
>
	<span class="flex shrink-0 w-4 h-4 items-center justify-center">
		<ArrowLeftIcon size={15} />
	</span>
	{#if !collapsed}
		<span class="whitespace-nowrap overflow-hidden">All clients</span>
	{/if}
</a>

<nav class="px-2 py-2 flex flex-col gap-0.5 border-t border-line-faint mt-2">
	{#each items as { href, label, Icon } (href)}
		{@const active = isActive(href)}
		<a
			{href}
			title={collapsed ? label : undefined}
			class="flex items-center gap-2 h-9 px-2 rounded-md text-[13px] font-medium transition-colors duration-fast
				{active ? 'bg-raised text-default' : 'text-muted hover:bg-hover hover:text-default'}"
			class:justify-center={collapsed}
		>
			<span class="flex shrink-0 w-5 h-5 items-center justify-center">
				<Icon size={17} weight={active ? 'fill' : 'regular'} />
			</span>
			{#if !collapsed}
				<span class="flex-1 whitespace-nowrap overflow-hidden">{label}</span>
			{/if}
		</a>
	{/each}
</nav>

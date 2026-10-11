<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/stores';
	import { StatusBadge } from '@neoworks-dev/ui';
	import PageHeader from '$lib/components/dashboard/PageHeader.svelte';
	import { reviewLabel, reviewTone } from '$lib/developer/status';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	const base = $derived(`/dashboard/developer/${data.owner.handle}/apps/${data.app.id}`);
	const tabs = $derived([
		{ label: 'Settings', href: base },
		{ label: 'Credentials', href: `${base}/credentials` },
		{ label: 'Logo', href: `${base}/logo` },
		{ label: 'Usage', href: `${base}/usage` },
		{ label: 'Review', href: `${base}/review` },
		{ label: 'Danger zone', href: `${base}/danger` },
	]);

	function isCurrent(href: string): boolean {
		return $page.url.pathname === href;
	}

	function ariaCurrent(href: string): 'page' | undefined {
		if (isCurrent(href)) {
			return 'page';
		}
		return undefined;
	}
</script>

<svelte:head>
	<title>{data.app.name} — NeoWorks</title>
</svelte:head>

<div class="h-full space-y-2 overflow-y-auto">
	<PageHeader title={data.app.name} subtitle="{data.app.type} app · {data.app.id}">
		{#snippet actions()}
			<div class="flex items-center gap-1.5">
				<StatusBadge tone={reviewTone(data.app.review.status)}>{reviewLabel(data.app.review.status)}</StatusBadge>
				{#if data.app.verified}
					<StatusBadge tone="green">Verified</StatusBadge>
				{:else}
					<StatusBadge>Unverified</StatusBadge>
				{/if}
			</div>
		{/snippet}
	</PageHeader>

	<nav aria-label="App sections" class="flex flex-wrap gap-1 rounded-xl border border-line-faint bg-elevated p-1">
		{#each tabs as tab (tab.href)}
			<a
				href={tab.href}
				aria-current={ariaCurrent(tab.href)}
				class="rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors hover:text-default"
				class:bg-raised={isCurrent(tab.href)}
				class:text-default={isCurrent(tab.href)}
				class:text-muted={!isCurrent(tab.href)}
			>
				{tab.label}
			</a>
		{/each}
	</nav>

	{@render children()}
</div>

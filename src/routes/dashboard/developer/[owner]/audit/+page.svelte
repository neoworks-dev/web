<script lang="ts">
	import PageHeader from '$lib/components/dashboard/PageHeader.svelte';
	import WidgetCard from '$lib/components/dashboard/WidgetCard.svelte';
	import { missingPermissionText } from '$lib/developer/permissions';
	import ListChecksIcon from 'phosphor-svelte/lib/ListChecksIcon';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const base = $derived(`/dashboard/developer/${data.owner.handle}`);
</script>

<svelte:head>
	<title>Audit log — NeoWorks</title>
</svelte:head>

<div class="h-full space-y-2 overflow-y-auto">
	<PageHeader title="Audit log" subtitle="Who changed what, newest first." />

	<WidgetCard title="Activity" icon={ListChecksIcon}>
		{#if data.organization === null}
			<p class="p-4 text-sm text-dim">Only organizations have an audit log.</p>
		{:else if data.page === null}
			<p class="p-4 text-sm text-dim">{missingPermissionText('audit.view')} to read the audit log.</p>
		{:else}
			{#if data.page.entries.length === 0}
				<p class="p-4 text-sm text-dim">Nothing recorded yet.</p>
			{/if}
			<ul class="divide-y divide-line-faint" data-testid="audit-entries">
				{#each data.page.entries as entry (entry.id)}
					<li class="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3">
						<span class="font-mono text-xs text-default">{entry.action}</span>
						<span class="text-sm text-muted">{entry.target.label}</span>
						<span class="ml-auto text-xs text-dim">{entry.actor.displayName} · {new Date(entry.at).toLocaleString()}</span>
					</li>
				{/each}
			</ul>
			{#if data.page.nextCursor !== null}
				<a class="block px-4 py-3 text-sm text-blue hover:underline" href="{base}/audit?before={data.page.nextCursor}">
					Older entries
				</a>
			{/if}
		{/if}
	</WidgetCard>
</div>

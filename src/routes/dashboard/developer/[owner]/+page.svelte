<script lang="ts">
	import { Card, StatusBadge } from '@neoworks-dev/ui';
	import PageHeader from '$lib/components/dashboard/PageHeader.svelte';
	import WidgetCard from '$lib/components/dashboard/WidgetCard.svelte';
	import { reviewLabel, reviewTone } from '$lib/developer/status';
	import CheckSquareIcon from 'phosphor-svelte/lib/CheckSquareIcon';
	import AppWindowIcon from 'phosphor-svelte/lib/AppWindowIcon';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const base = $derived(`/dashboard/developer/${data.owner.handle}`);

	function kindLabel(kind: 'user' | 'organization'): string {
		if (kind === 'organization') {
			return 'Organization';
		}
		return 'Personal';
	}
</script>

<svelte:head>
	<title>Developer overview — NeoWorks</title>
</svelte:head>

<div class="h-full space-y-2 overflow-y-auto">
	<PageHeader
		title={data.owner.displayName}
		subtitle="@{data.owner.handle} · {kindLabel(data.owner.kind)}"
	/>

	<div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
		<Card surface="elevated">
			<p class="text-xs font-medium uppercase tracking-caps text-dim">Apps</p>
			<p class="text-2xl font-semibold text-default" data-testid="count-apps">{data.apps.length}</p>
		</Card>
		<Card surface="elevated">
			<p class="text-xs font-medium uppercase tracking-caps text-dim">Schemas</p>
			<p class="text-2xl font-semibold text-default" data-testid="count-schemas">{data.schemaCount}</p>
		</Card>
		<Card surface="elevated">
			<p class="text-xs font-medium uppercase tracking-caps text-dim">Members</p>
			<p class="text-2xl font-semibold text-default" data-testid="count-members">{data.memberCount}</p>
		</Card>
	</div>

	<WidgetCard title="To do" subtitle="Things that need your attention." icon={CheckSquareIcon}>
		{#if data.todos.length === 0}
			<p class="p-4 text-sm text-dim">Nothing to do.</p>
		{:else}
			<ul class="divide-y divide-line-faint" data-testid="todos">
				{#each data.todos as todo (todo.id)}
					<li>
						<a href={todo.href} class="block px-4 py-3 text-sm text-default hover:bg-hover">{todo.text}</a>
					</li>
				{/each}
			</ul>
		{/if}
	</WidgetCard>

	<WidgetCard title="Apps" subtitle="Review and verification status." icon={AppWindowIcon}>
		{#if data.apps.length === 0}
			<p class="p-4 text-sm text-dim">No apps yet.</p>
		{:else}
			<ul class="divide-y divide-line-faint" data-testid="app-statuses">
				{#each data.apps as app (app.id)}
					<li class="flex items-center gap-3 px-4 py-3">
						<a href="{base}/apps/{app.id}" class="min-w-0 flex-1 truncate text-sm font-medium text-default hover:underline">
							{app.name}
						</a>
						<StatusBadge tone={reviewTone(app.review.status)}>{reviewLabel(app.review.status)}</StatusBadge>
						{#if app.verified}
							<StatusBadge tone="green">Verified</StatusBadge>
						{:else}
							<StatusBadge>Unverified</StatusBadge>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</WidgetCard>
</div>

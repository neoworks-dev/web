<script lang="ts">
	import { goto } from '$app/navigation';
	import { IconCircle, ListRow, StatusBadge } from '@neoworks-dev/ui';
	import PageHeader from '$lib/components/dashboard/PageHeader.svelte';
	import PermissionButton from '$lib/components/developer/PermissionButton.svelte';
	import { holdsPermission } from '$lib/developer/permissions';
	import { reviewLabel, reviewTone } from '$lib/developer/status';
	import AppWindowIcon from 'phosphor-svelte/lib/AppWindowIcon';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const base = $derived(`/dashboard/developer/${data.owner.handle}`);
	const canCreate = $derived(holdsPermission(data.grants, 'apps.create'));
</script>

<svelte:head>
	<title>Apps — NeoWorks</title>
</svelte:head>

<div class="h-full space-y-2 overflow-y-auto">
	<PageHeader title="Apps" subtitle="OAuth apps registered by @{data.owner.handle}.">
		{#snippet actions()}
			<PermissionButton
				allowed={canCreate}
				permission="apps.create"
				variant="primary"
				type="button"
				onclick={() => goto(`${base}/apps/new`)}
			>
				New app
			</PermissionButton>
		{/snippet}
	</PageHeader>

	{#if data.apps.length === 0}
		<p class="rounded-xl border border-line-faint bg-elevated p-5 text-sm text-dim">No apps registered yet.</p>
	{/if}

	<ul class="flex flex-col gap-2">
		{#each data.apps as app (app.id)}
			<li>
				<ListRow title={app.name} subtitle="{app.type} · {app.id}" href="{base}/apps/{app.id}" chevron>
					{#snippet leading()}
						<IconCircle icon={AppWindowIcon} />
					{/snippet}
					{#snippet trailing()}
						<div class="flex items-center gap-1.5">
							<StatusBadge tone={reviewTone(app.reviewStatus)}>{reviewLabel(app.reviewStatus)}</StatusBadge>
							{#if app.verified}
								<StatusBadge tone="green">Verified</StatusBadge>
							{/if}
						</div>
					{/snippet}
				</ListRow>
			</li>
		{/each}
	</ul>
</div>

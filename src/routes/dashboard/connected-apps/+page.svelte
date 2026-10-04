<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, StatusBadge } from '@neoworks-dev/ui';
	import PageHeader from '$lib/components/dashboard/PageHeader.svelte';
	import WidgetCard from '$lib/components/dashboard/WidgetCard.svelte';
	import PlugsConnectedIcon from 'phosphor-svelte/lib/PlugsConnectedIcon';
	import type { ActionData, PageData } from './$types';
	import type { ConnectedInstall } from './+page.server';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	function displayName(install: ConnectedInstall): string {
		if (install.name === null) {
			return install.clientId;
		}
		return install.name;
	}

	const activeInstalls = $derived(data.installs.filter((install) => install.revokedAt === null));
</script>

<svelte:head>
	<title>Connected Apps — NeoWorks</title>
</svelte:head>

<div class="h-full overflow-y-auto space-y-2">
	<PageHeader
		title="Connected Apps"
		subtitle="Apps that can access parts of your account. Revoking blocks an app immediately; its keys are rotated the next time you open your vault."
	/>

	<WidgetCard title="Apps" subtitle="Installs you have approved." icon={PlugsConnectedIcon}>
		{#if form?.message}
			<p class="px-4 py-2 text-sm text-red">{form.message}</p>
		{/if}
		{#if activeInstalls.length === 0}
			<p class="p-5 text-sm text-dim">No apps are connected.</p>
		{:else}
			<ul class="divide-y divide-line-faint">
				{#each activeInstalls as install (install.id)}
					<li class="flex items-center gap-3 px-4 py-3">
						<div class="min-w-0 flex-1">
							<p class="truncate text-sm font-medium text-default">{displayName(install)}</p>
							<p class="truncate text-xs text-dim">
								{install.clientId} · connected {new Date(install.createdAt).toLocaleDateString()}
							</p>
						</div>
						<StatusBadge tone="green">Active</StatusBadge>
						<form method="POST" action="?/revoke" use:enhance>
							<input type="hidden" name="installId" value={install.id} />
							<Button type="submit" variant="danger" size="sm">Revoke</Button>
						</form>
					</li>
				{/each}
			</ul>
		{/if}
	</WidgetCard>
</div>

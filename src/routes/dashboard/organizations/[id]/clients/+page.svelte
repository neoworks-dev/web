<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { sdk } from '$lib/sdk';
	import type { OAuthClient } from '@neoworks-dev/sdk';
	import PlusIcon from 'phosphor-svelte/lib/PlusIcon';
	import TrashIcon from 'phosphor-svelte/lib/TrashIcon';
	import KeyIcon from 'phosphor-svelte/lib/KeyIcon';
	import PageHeader from '$lib/components/dashboard/PageHeader.svelte';
	import WidgetCard from '$lib/components/dashboard/WidgetCard.svelte';

	const orgId = $derived($page.params.id ?? "");

	let clients = $state<OAuthClient[]>([]);
	let loading = $state(true);
	let deletingId = $state<string | null>(null);

	sdk.clients
		.list(orgId)
		.then((res) => {
			clients = res;
			loading = false;
		})
		.catch(() => (loading = false));

	async function deleteClient(id: string) {
		deletingId = id;
		try {
			await sdk.clients.delete(id);
			clients = clients.filter((c) => c.id !== id);
		} finally {
			deletingId = null;
		}
	}
</script>

<svelte:head>
	<title>Clients — NeoWorks</title>
</svelte:head>

<div class="h-full overflow-y-auto space-y-2">
	<PageHeader title="Clients" subtitle="OAuth clients owned by this organization.">
		{#snippet actions()}
			<button
				class="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-content text-[13px] font-medium hover:opacity-90 transition-opacity"
				onclick={() => goto(`/dashboard/organizations/${orgId}/clients/new`)}
			>
				<PlusIcon size={15} />
				New client
			</button>
		{/snippet}
	</PageHeader>

	<WidgetCard title="Clients" subtitle="OAuth clients registered to this organization." icon={KeyIcon}>
		<div class="p-4">
		{#if loading}
			<div class="space-y-2">
				{#each { length: 2 } as _}<div class="skeleton h-20 w-full rounded-xl"></div>{/each}
			</div>
		{:else if clients.length === 0}
			<div class="flex flex-col items-center justify-center py-16 text-center">
				<KeyIcon size={32} class="text-dim mb-3" />
				<p class="text-[14px] font-medium text-muted">No clients yet</p>
				<p class="text-[13px] text-dim mt-1">Create an OAuth client owned by this organization.</p>
			</div>
		{:else}
			<div class="space-y-2">
				{#each clients as client (client.id)}
					<div class="rounded-xl border border-line-faint bg-surface p-5 flex items-start justify-between gap-4 hover:border-line-strong transition-colors">
					<a href={`/dashboard/organizations/${orgId}/clients/${client.id}`} class="min-w-0 flex-1 space-y-2">
						<div class="flex items-center gap-2 flex-wrap">
							{#if client.name}
								<span class="text-[14px] font-medium text-default">{client.name}</span>
							{/if}
							<span class="font-mono text-[13px] {client.name ? 'text-dim' : 'text-default font-medium'}">{client.id}</span>
							<span class="text-[11px] font-medium px-1.5 py-0.5 rounded border {client.public ? 'text-green border-green/30 bg-green-soft' : 'text-dim border-line bg-raised'}">
								{client.public ? 'Public' : 'Confidential'}
							</span>
						</div>
						<div class="flex flex-wrap gap-1">
							{#each client.scopes as scope}
								<span class="font-mono text-[11px] px-1.5 py-0.5 rounded bg-raised border border-line-faint text-muted">{scope}</span>
							{/each}
						</div>
					</a>
					<button
						class="shrink-0 flex items-center gap-1.5 h-7 px-2.5 rounded text-[12px] text-dim hover:text-red hover:bg-red-soft transition-colors disabled:opacity-40"
						onclick={() => deleteClient(client.id)}
						disabled={deletingId === client.id}
					>
						<TrashIcon size={13} />
						{deletingId === client.id ? 'Deleting…' : 'Delete'}
					</button>
				</div>
			{/each}
			</div>
		{/if}
		</div>
	</WidgetCard>
</div>

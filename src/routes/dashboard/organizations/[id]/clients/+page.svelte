<script lang="ts">
	import { page } from '$app/stores';
	import { sdk } from '$lib/sdk';
	import type { OAuthClient, CreateClientResult } from '@neoworks-dev/sdk';
	import PlusIcon from 'phosphor-svelte/lib/PlusIcon';
	import TrashIcon from 'phosphor-svelte/lib/TrashIcon';
	import KeyIcon from 'phosphor-svelte/lib/KeyIcon';
	import XIcon from 'phosphor-svelte/lib/XIcon';
	import CopyIcon from 'phosphor-svelte/lib/CopyIcon';
	import CheckIcon from 'phosphor-svelte/lib/CheckIcon';
	import PageHeader from '$lib/components/dashboard/PageHeader.svelte';
	import WidgetCard from '$lib/components/dashboard/WidgetCard.svelte';

	const orgId = $derived($page.params.id ?? "");

	let clients = $state<OAuthClient[]>([]);
	let loading = $state(true);

	let showCreate = $state(false);
	let creating = $state(false);
	let createError = $state<string | null>(null);
	let formId = $state('');
	let formScopes = $state('');
	let formRedirectUris = $state('');
	let formPublic = $state(false);

	let newCredentials = $state<CreateClientResult | null>(null);
	let copied = $state(false);
	let deletingId = $state<string | null>(null);

	sdk.clients
		.list()
		.then((res) => {
			clients = res;
			loading = false;
		})
		.catch(() => (loading = false));

	function resetForm() {
		formId = '';
		formScopes = '';
		formRedirectUris = '';
		formPublic = false;
		createError = null;
	}

	async function createClient() {
		if (!formId.trim()) {
			createError = 'Client ID is required';
			return;
		}
		const scopes = formScopes.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
		const redirectUris = formRedirectUris.split(/[\s,\n]+/).map((s) => s.trim()).filter(Boolean);
		if (scopes.length === 0) {
			createError = 'At least one scope is required';
			return;
		}
		if (redirectUris.length === 0) {
			createError = 'At least one redirect URI is required';
			return;
		}

		creating = true;
		createError = null;
		try {
			const res = await sdk.clients.create({
				id: formId.trim(),
				organizationId: orgId,
				redirectUris,
				scopes,
				public: formPublic,
			});
			clients = [...clients, res.client];
			newCredentials = res;
			resetForm();
			showCreate = false;
		} catch (e: any) {
			createError = e?.message ?? 'Failed to create client';
		} finally {
			creating = false;
		}
	}

	async function deleteClient(id: string) {
		deletingId = id;
		try {
			await sdk.clients.delete(id);
			clients = clients.filter((c) => c.id !== id);
		} finally {
			deletingId = null;
		}
	}

	async function copySecret() {
		if (!newCredentials?.secret) return;
		await navigator.clipboard.writeText(newCredentials.secret);
		copied = true;
		setTimeout(() => (copied = false), 1500);
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
				onclick={() => {
					resetForm();
					showCreate = true;
				}}
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
							<span class="font-mono text-[14px] font-medium text-default">{client.id}</span>
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

{#if showCreate}
	<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
	<div class="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-6" onclick={() => (showCreate = false)}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="w-full max-w-lg rounded-2xl border border-line bg-elevated shadow-xl" onclick={(e) => e.stopPropagation()}>
			<div class="flex items-center justify-between px-6 py-5 border-b border-line-faint">
				<h2 class="text-[15px] font-semibold text-default">New client</h2>
				<button class="text-dim hover:text-default transition-colors" onclick={() => (showCreate = false)}>
					<XIcon size={18} />
				</button>
			</div>
			<div class="px-6 py-5 space-y-4">
				<div>
					<label class="block text-[12px] font-medium text-muted mb-1.5" for="c-id">Client ID</label>
					<input id="c-id" bind:value={formId} placeholder="my-app" class="w-full h-9 px-3 rounded-lg border border-line bg-surface text-[13px] text-default placeholder:text-dim focus:outline-none focus:border-primary transition-colors" />
				</div>
				<div>
					<label class="block text-[12px] font-medium text-muted mb-1.5" for="c-scopes">Scopes <span class="text-dim font-normal">(space or comma separated)</span></label>
					<input id="c-scopes" bind:value={formScopes} placeholder="openid email profile" class="w-full h-9 px-3 rounded-lg border border-line bg-surface text-[13px] text-default placeholder:text-dim focus:outline-none focus:border-primary transition-colors" />
				</div>
				<div>
					<label class="block text-[12px] font-medium text-muted mb-1.5" for="c-uris">Redirect URIs <span class="text-dim font-normal">(one per line)</span></label>
					<textarea id="c-uris" bind:value={formRedirectUris} placeholder="https://your-app.com/callback" rows={3} class="w-full px-3 py-2 rounded-lg border border-line bg-surface text-[13px] text-default placeholder:text-dim focus:outline-none focus:border-primary transition-colors resize-none"></textarea>
				</div>
				<label class="flex items-center gap-2 cursor-pointer select-none">
					<input type="checkbox" bind:checked={formPublic} class="rounded" />
					<span class="text-[13px] text-default">Public client (PKCE, no secret)</span>
				</label>
				{#if createError}<p class="text-[12px] text-red">{createError}</p>{/if}
			</div>
			<div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-line-faint">
				<button class="h-9 px-4 rounded-lg text-[13px] text-muted hover:text-default transition-colors" onclick={() => (showCreate = false)}>Cancel</button>
				<button class="h-9 px-4 rounded-lg bg-primary text-primary-content text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50" onclick={createClient} disabled={creating}>
					{creating ? 'Creating…' : 'Create client'}
				</button>
			</div>
		</div>
	</div>
{/if}

{#if newCredentials?.secret}
	<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
	<div class="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-6" onclick={() => (newCredentials = null)}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="w-full max-w-lg rounded-2xl border border-line bg-elevated shadow-xl" onclick={(e) => e.stopPropagation()}>
			<div class="px-6 py-5 border-b border-line-faint">
				<h2 class="text-[15px] font-semibold text-default">Client created</h2>
				<p class="text-[12px] text-red mt-0.5">Save this secret — it won't be shown again.</p>
			</div>
			<div class="px-6 py-5">
				<div class="flex items-center gap-2 rounded-lg border border-line-faint bg-surface px-3 py-2">
					<span class="font-mono text-[12px] text-muted flex-1 truncate select-all">{newCredentials.secret}</span>
					<button class="text-dim hover:text-default transition-colors" onclick={copySecret}>
						{#if copied}<CheckIcon size={14} class="text-green" />{:else}<CopyIcon size={14} />{/if}
					</button>
				</div>
			</div>
			<div class="px-6 py-4 border-t border-line-faint">
				<button class="w-full h-9 rounded-lg bg-primary text-primary-content text-[13px] font-medium hover:opacity-90 transition-opacity" onclick={() => (newCredentials = null)}>Done</button>
			</div>
		</div>
	</div>
{/if}

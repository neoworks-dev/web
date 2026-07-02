<script lang="ts">
	import { sdk } from '$lib/sdk';
	import type { OAuthClient, CreateClientResult, Organization } from '@neoworks-dev/sdk';
	import { menuReveal } from '$lib/transitions';
	import PlusIcon from 'phosphor-svelte/lib/PlusIcon';
	import TrashIcon from 'phosphor-svelte/lib/TrashIcon';
	import CopyIcon from 'phosphor-svelte/lib/CopyIcon';
	import CheckIcon from 'phosphor-svelte/lib/CheckIcon';
	import AppWindowIcon from 'phosphor-svelte/lib/AppWindowIcon';
	import XIcon from 'phosphor-svelte/lib/XIcon';
	import GlobeIcon from 'phosphor-svelte/lib/GlobeIcon';
	import PageHeader from '$lib/components/dashboard/PageHeader.svelte';
	import WidgetCard from '$lib/components/dashboard/WidgetCard.svelte';

	let clients = $state<OAuthClient[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	// Create form
	let showCreate = $state(false);
	let creating = $state(false);
	let createError = $state<string | null>(null);
	let formId = $state('');
	let formOrganizationId = $state('');
	let formPublic = $state(false);
	let formScopes = $state('');
	let formRedirectUris = $state('');

	// Organizations the user can create clients under
	let organizations = $state<Organization[]>([]);

	// One-time credentials after creation
	let newCredentials = $state<CreateClientResult | null>(null);

	// Copy feedback
	let copied = $state<string | null>(null);

	// Delete confirm
	let deletingId = $state<string | null>(null);

	// Clients are owned by organizations; aggregate across the orgs the user
	// belongs to rather than listing every client in the system.
	async function loadClients() {
		try {
			const orgs = await sdk.organizations.list();
			organizations = orgs;
			if (!formOrganizationId && orgs.length > 0) formOrganizationId = orgs[0].id;
			const perOrg = await Promise.all(orgs.map((org) => sdk.clients.list(org.id)));
			clients = perOrg.flat();
		} catch (e: any) {
			error = e?.message ?? 'Failed to load clients';
		} finally {
			loading = false;
		}
	}
	loadClients();

	async function createClient() {
		if (!formId.trim()) { createError = 'Client ID is required'; return; }
		if (!formOrganizationId) { createError = 'An owning organization is required'; return; }
		const scopes = formScopes.split(/[\s,]+/).map(s => s.trim()).filter(Boolean);
		const redirectUris = formRedirectUris.split(/[\s,\n]+/).map(s => s.trim()).filter(Boolean);
		if (scopes.length === 0) { createError = 'At least one scope is required'; return; }
		if (redirectUris.length === 0) { createError = 'At least one redirect URI is required'; return; }

		creating = true;
		createError = null;
		try {
			const res = await sdk.clients.create({
				id: formId.trim(),
				organizationId: formOrganizationId,
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
			clients = clients.filter(c => c.id !== id);
		} finally {
			deletingId = null;
		}
	}

	function resetForm() {
		formId = '';
		formOrganizationId = organizations.length > 0 ? organizations[0].id : '';
		formPublic = false;
		formScopes = '';
		formRedirectUris = '';
		createError = null;
	}

	async function copy(text: string, key: string) {
		await navigator.clipboard.writeText(text);
		copied = key;
		setTimeout(() => { if (copied === key) copied = null; }, 1500);
	}
</script>

<svelte:head>
	<title>OAuth Applications — NeoWorks</title>
</svelte:head>

<div class="h-full overflow-y-auto space-y-2">
	<PageHeader title="OAuth Applications" subtitle="Manage OAuth 2.0 clients for your applications.">
		{#snippet actions()}
			<button
				class="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-content text-[13px] font-medium hover:opacity-90 transition-opacity"
				onclick={() => { resetForm(); showCreate = true; }}
			>
				<PlusIcon size={15} />
				New application
			</button>
		{/snippet}
	</PageHeader>

	<WidgetCard title="Applications" subtitle="OAuth clients registered for your account." icon={AppWindowIcon}>
		<div class="p-4">
		{#if loading}
			<div class="space-y-2">
				{#each { length: 2 } as _}
					<div class="skeleton h-24 w-full rounded-xl"></div>
				{/each}
			</div>
		{:else if error}
			<div class="rounded-xl border border-red/30 bg-red-soft px-5 py-4 text-[13px] text-red">{error}</div>
		{:else if clients.length === 0}
			<div class="flex flex-col items-center justify-center py-16 text-center">
				<AppWindowIcon size={32} class="text-dim mb-3" />
				<p class="text-[14px] font-medium text-muted">No applications yet</p>
				<p class="text-[13px] text-dim mt-1">Create your first OAuth client to get started.</p>
			</div>
		{:else}
			<div class="space-y-2">
				{#each clients as client (client.id)}
					<div class="rounded-xl border border-line-faint bg-surface p-5 space-y-4" in:menuReveal>
					<div class="flex items-start justify-between gap-4">
						<div class="space-y-1 min-w-0">
							<div class="flex items-center gap-2 flex-wrap">
								<span class="font-mono text-[14px] font-medium text-default">{client.id}</span>
								<span class="text-[11px] font-medium px-1.5 py-0.5 rounded border {client.public ? 'text-green border-green/30 bg-green-soft' : 'text-dim border-line bg-raised'}">
									{client.public ? 'Public' : 'Confidential'}
								</span>
								{#if client.auto_grant_scopes}
									<span class="text-[11px] font-medium px-1.5 py-0.5 rounded border text-blue border-blue/30 bg-blue-soft">
										Auto-grant
									</span>
								{/if}
							</div>
						</div>
						<button
							class="shrink-0 flex items-center gap-1.5 h-7 px-2.5 rounded text-[12px] text-dim hover:text-red hover:bg-red-soft border border-transparent hover:border-red/20 transition-colors duration-fast disabled:opacity-40"
							onclick={() => deleteClient(client.id)}
							disabled={deletingId === client.id}
						>
							<TrashIcon size={13} />
							{deletingId === client.id ? 'Deleting…' : 'Delete'}
						</button>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[12px]">
						<div>
							<p class="text-[11px] font-medium text-dim uppercase tracking-caps mb-1.5">Scopes</p>
							<div class="flex flex-wrap gap-1">
								{#each client.scopes as scope}
									<span class="font-mono px-1.5 py-0.5 rounded bg-raised border border-line-faint text-muted">{scope}</span>
								{/each}
							</div>
						</div>
						<div>
							<p class="text-[11px] font-medium text-dim uppercase tracking-caps mb-1.5">Redirect URIs</p>
							<div class="space-y-0.5">
								{#each client.redirect_uris as uri}
									<p class="font-mono text-muted truncate">{uri}</p>
								{/each}
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
		{/if}
		</div>
	</WidgetCard>
</div>

<!-- Create modal -->
{#if showCreate}
	<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
	<div class="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-6" onclick={() => showCreate = false}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="w-full max-w-lg rounded-2xl border border-line bg-elevated shadow-xl"
			onclick={(e) => e.stopPropagation()}
			in:menuReveal
		>
			<div class="flex items-center justify-between px-6 py-5 border-b border-line-faint">
				<h2 class="text-[15px] font-semibold text-default">New OAuth application</h2>
				<button class="text-dim hover:text-default transition-colors" onclick={() => showCreate = false}>
					<XIcon size={18} />
				</button>
			</div>

			<div class="px-6 py-5 space-y-4">
				<div>
					<label class="block text-[12px] font-medium text-muted mb-1.5" for="form-id">Client ID</label>
					<input
						id="form-id"
						bind:value={formId}
						placeholder="my-app"
						class="w-full h-9 px-3 rounded-lg border border-line bg-surface text-[13px] text-default placeholder:text-dim focus:outline-none focus:border-primary transition-colors"
					/>
				</div>

				<div>
					<label class="block text-[12px] font-medium text-muted mb-1.5" for="form-org">Owning organization</label>
					{#if organizations.length === 0}
						<p class="text-[12px] text-dim">No organizations yet — create one first to own this client.</p>
					{:else}
						<select
							id="form-org"
							bind:value={formOrganizationId}
							class="w-full h-9 px-3 rounded-lg border border-line bg-surface text-[13px] text-default focus:outline-none focus:border-primary transition-colors"
						>
							{#each organizations as org (org.id)}
								<option value={org.id}>{org.name}</option>
							{/each}
						</select>
					{/if}
				</div>

				<div>
					<label class="block text-[12px] font-medium text-muted mb-1.5" for="form-scopes">Scopes <span class="text-dim font-normal">(space or comma separated)</span></label>
					<input
						id="form-scopes"
						bind:value={formScopes}
						placeholder="openid email profile"
						class="w-full h-9 px-3 rounded-lg border border-line bg-surface text-[13px] text-default placeholder:text-dim focus:outline-none focus:border-primary transition-colors"
					/>
				</div>

				<div>
					<label class="block text-[12px] font-medium text-muted mb-1.5" for="form-uris">Redirect URIs <span class="text-dim font-normal">(one per line or comma separated)</span></label>
					<textarea
						id="form-uris"
						bind:value={formRedirectUris}
						placeholder="https://your-app.com/callback"
						rows={3}
						class="w-full px-3 py-2 rounded-lg border border-line bg-surface text-[13px] text-default placeholder:text-dim focus:outline-none focus:border-primary transition-colors resize-none"
					></textarea>
				</div>

				<div class="flex gap-6">
					<label class="flex items-center gap-2 cursor-pointer select-none">
						<input type="checkbox" bind:checked={formPublic} class="rounded" />
						<span class="text-[13px] text-default flex items-center gap-1.5">
							<GlobeIcon size={14} class="text-dim" />
							Public client
						</span>
					</label>
				</div>

				{#if createError}
					<p class="text-[12px] text-red">{createError}</p>
				{/if}
			</div>

			<div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-line-faint">
				<button
					class="h-9 px-4 rounded-lg text-[13px] text-muted hover:text-default transition-colors"
					onclick={() => showCreate = false}
				>Cancel</button>
				<button
					class="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-content text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
					onclick={createClient}
					disabled={creating}
				>
					{creating ? 'Creating…' : 'Create application'}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- One-time credentials reveal -->
{#if newCredentials}
	<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
	<div class="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-6" onclick={() => newCredentials = null}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="w-full max-w-lg rounded-2xl border border-line bg-elevated shadow-xl"
			onclick={(e) => e.stopPropagation()}
			in:menuReveal
		>
			<div class="flex items-center justify-between px-6 py-5 border-b border-line-faint">
				<div>
					<h2 class="text-[15px] font-semibold text-default">Application created</h2>
					<p class="text-[12px] text-red mt-0.5">Save these credentials — they won't be shown again.</p>
				</div>
				<button class="text-dim hover:text-default transition-colors" onclick={() => newCredentials = null}>
					<XIcon size={18} />
				</button>
			</div>

			<div class="px-6 py-5 space-y-3">
				{#if newCredentials.secret}
					{@render credRow('Client secret', newCredentials.secret, 'secret')}
				{/if}
			</div>

			<div class="px-6 py-4 border-t border-line-faint">
				<button
					class="w-full h-9 rounded-lg bg-primary text-primary-content text-[13px] font-medium hover:opacity-90 transition-opacity"
					onclick={() => newCredentials = null}
				>Done</button>
			</div>
		</div>
	</div>
{/if}

{#snippet credRow(label: string, value: string, key: string)}
	<div>
		<p class="text-[11px] font-medium text-dim uppercase tracking-caps mb-1">{label}</p>
		<div class="flex items-center gap-2 rounded-lg border border-line-faint bg-surface px-3 py-2">
			<span class="font-mono text-[12px] text-muted flex-1 truncate select-all">{value}</span>
			<button
				class="shrink-0 text-dim hover:text-default transition-colors"
				onclick={() => copy(value, key)}
			>
				{#if copied === key}
					<CheckIcon size={14} class="text-green" />
				{:else}
					<CopyIcon size={14} />
				{/if}
			</button>
		</div>
	</div>
{/snippet}

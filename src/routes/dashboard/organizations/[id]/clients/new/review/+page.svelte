<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { sdk } from '$lib/sdk';
	import type { CreateClientResult } from '@neoworks-dev/sdk';
	import { clientDraft, resetClientDraft } from '$lib/clientWizard.svelte';
	import CopyIcon from 'phosphor-svelte/lib/CopyIcon';
	import CheckIcon from 'phosphor-svelte/lib/CheckIcon';

	const orgId = $derived($page.params.id ?? '');

	const redirectUris = $derived(
		clientDraft.redirectUris
			.split(/[\s,\n]+/)
			.map((uri) => uri.trim())
			.filter(Boolean),
	);

	let creating = $state(false);
	let error = $state<string | null>(null);
	let credentials = $state<CreateClientResult | null>(null);
	let copied = $state(false);

	async function create() {
		if (!clientDraft.id.trim()) {
			error = 'A client ID is required.';
			return;
		}
		if (redirectUris.length === 0) {
			error = 'At least one redirect URI is required.';
			return;
		}
		if (clientDraft.scopes.length === 0) {
			error = 'Select at least one scope.';
			return;
		}

		creating = true;
		error = null;
		try {
			credentials = await sdk.clients.create({
				id: clientDraft.id.trim(),
				organizationId: orgId,
				name: clientDraft.name.trim() || undefined,
				redirectUris,
				scopes: clientDraft.scopes,
				public: clientDraft.isPublic,
			});
		} catch (e: any) {
			error = e?.message ?? 'Could not create the client.';
		} finally {
			creating = false;
		}
	}

	async function copySecret() {
		if (!credentials?.secret) return;
		await navigator.clipboard.writeText(credentials.secret);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}

	function done() {
		resetClientDraft(orgId);
		goto(`/dashboard/organizations/${orgId}/clients`);
	}
</script>

<svelte:head>
	<title>New client · Review — NeoWorks</title>
</svelte:head>

{#if credentials}
	<div class="space-y-5">
		<div>
			<h2 class="text-[15px] font-semibold text-default">Client created</h2>
			<p class="text-[13px] text-dim mt-0.5">
				{#if credentials.secret}
					Copy the secret now — it won’t be shown again.
				{:else}
					This is a public client, so it has no secret.
				{/if}
			</p>
		</div>

		<div class="rounded-xl border border-line-faint bg-surface p-4 space-y-3">
			<div>
				<p class="text-[11px] font-medium text-dim uppercase tracking-caps mb-1">Client ID</p>
				<p class="font-mono text-[13px] text-default break-all">{credentials.client.id}</p>
			</div>
			{#if credentials.secret}
				<div>
					<p class="text-[11px] font-medium text-dim uppercase tracking-caps mb-1">Secret</p>
					<div class="flex items-center gap-2">
						<code class="flex-1 font-mono text-[13px] text-default break-all bg-raised rounded-lg px-3 py-2 border border-line-faint">{credentials.secret}</code>
						<button
							class="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-line text-[12px] text-muted hover:text-default hover:border-line-strong transition-colors shrink-0"
							onclick={copySecret}
						>
							{#if copied}<CheckIcon size={14} /> Copied{:else}<CopyIcon size={14} /> Copy{/if}
						</button>
					</div>
				</div>
			{/if}
		</div>

		<div class="flex items-center justify-end pt-2 border-t border-line-faint">
			<button
				class="h-9 px-4 rounded-lg bg-action text-action-fg text-[13px] font-medium hover:opacity-90 transition-opacity"
				onclick={done}
			>Done</button>
		</div>
	</div>
{:else}
	<div class="space-y-5">
		<div>
			<h2 class="text-[15px] font-semibold text-default">Review</h2>
			<p class="text-[13px] text-dim mt-0.5">Confirm the client before creating it.</p>
		</div>

		<div class="space-y-3 text-[13px]">
			{@render row('Client ID', clientDraft.id || '—')}
			{@render row('Display name', clientDraft.name || 'None')}
			{@render row('Type', clientDraft.isPublic ? 'Public (PKCE)' : 'Confidential')}
			{@render row('Redirect URIs', redirectUris.length ? `${redirectUris.length}` : 'None')}
			{@render row('Scopes', clientDraft.scopes.length ? `${clientDraft.scopes.length}` : 'None')}
		</div>

		{#if clientDraft.scopes.length > 0}
			<div class="flex flex-wrap gap-1.5">
				{#each clientDraft.scopes as scope (scope)}
					<span class="font-mono text-[11px] text-muted bg-raised border border-line-faint rounded px-2 py-1">{scope}</span>
				{/each}
			</div>
		{/if}

		{#if error}<p class="text-[12px] text-red">{error}</p>{/if}

		<div class="flex items-center justify-between gap-3 pt-2 border-t border-line-faint">
			<button
				class="h-9 px-4 rounded-lg text-[13px] text-muted hover:text-default transition-colors"
				onclick={() => goto(`/dashboard/organizations/${orgId}/clients/new/scopes`)}
			>Back</button>
			<button
				class="h-9 px-4 rounded-lg bg-action text-action-fg text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
				onclick={create}
				disabled={creating}
			>{creating ? 'Creating…' : 'Create client'}</button>
		</div>
	</div>
{/if}

{#snippet row(label: string, value: string)}
	<div class="flex items-start justify-between gap-4">
		<span class="text-[12px] text-dim uppercase tracking-caps">{label}</span>
		<span class="text-default text-right truncate max-w-[60%]">{value}</span>
	</div>
{/snippet}

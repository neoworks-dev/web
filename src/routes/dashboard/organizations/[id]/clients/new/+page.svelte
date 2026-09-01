<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { clientDraft, ensureDraftForOrg } from '$lib/clientWizard.svelte';

	const orgId = $derived($page.params.id ?? '');
	let error = $state<string | null>(null);

	// Keep the draft bound to this org; resets if arriving fresh or switching orgs.
	$effect(() => {
		ensureDraftForOrg(orgId);
	});

	function next() {
		if (!clientDraft.id.trim()) {
			error = 'A client ID is required.';
			return;
		}
		goto(`/dashboard/organizations/${orgId}/clients/new/scopes`);
	}
</script>

<svelte:head>
	<title>New client · Details — NeoWorks</title>
</svelte:head>

<div class="space-y-5">
	<div>
		<h2 class="text-[15px] font-semibold text-default">Client details</h2>
		<p class="text-[13px] text-dim mt-0.5">Identify the client and where it can redirect.</p>
	</div>

	<div>
		<label class="block text-[12px] font-medium text-muted mb-1.5" for="client-id">Client ID</label>
		<input
			id="client-id"
			bind:value={clientDraft.id}
			placeholder="myapp.example.com"
			class="w-full h-9 px-3 rounded-lg border border-line bg-surface text-[13px] font-mono text-default placeholder:text-dim focus:outline-none focus:border-primary transition-colors"
		/>
		<p class="text-[12px] text-dim mt-1.5">Used as the OAuth client_id. Must be unique.</p>
	</div>

	<div>
		<label class="block text-[12px] font-medium text-muted mb-1.5" for="client-name">Display name</label>
		<input
			id="client-name"
			bind:value={clientDraft.name}
			placeholder="My App"
			class="w-full h-9 px-3 rounded-lg border border-line bg-surface text-[13px] text-default placeholder:text-dim focus:outline-none focus:border-primary transition-colors"
		/>
		<p class="text-[12px] text-dim mt-1.5">Shown to users on the consent screen. Optional.</p>
	</div>

	<div>
		<label class="block text-[12px] font-medium text-muted mb-1.5" for="client-redirects">Redirect URIs</label>
		<textarea
			id="client-redirects"
			bind:value={clientDraft.redirectUris}
			placeholder="https://myapp.example.com/auth/callback"
			rows={3}
			class="w-full px-3 py-2 rounded-lg border border-line bg-surface text-[13px] font-mono text-default placeholder:text-dim focus:outline-none focus:border-primary transition-colors resize-none"
		></textarea>
		<p class="text-[12px] text-dim mt-1.5">One per line (or comma-separated).</p>
	</div>

	<div>
		<label class="flex items-start gap-3 cursor-pointer">
			<input type="checkbox" bind:checked={clientDraft.isPublic} class="mt-0.5 accent-primary" />
			<span>
				<span class="block text-[13px] text-default">Public client (PKCE)</span>
				<span class="block text-[12px] text-dim">No secret is issued. For SPAs and native apps that can’t store one.</span>
			</span>
		</label>
	</div>

	{#if error}<p class="text-[12px] text-red">{error}</p>{/if}

	<div class="flex items-center justify-end gap-3 pt-2 border-t border-line-faint">
		<button
			class="h-9 px-4 rounded-lg text-[13px] text-muted hover:text-default transition-colors"
			onclick={() => goto(`/dashboard/organizations/${orgId}/clients`)}
		>Cancel</button>
		<button
			class="h-9 px-4 rounded-lg bg-action text-action-fg text-[13px] font-medium hover:opacity-90 transition-opacity"
			onclick={next}
		>Continue</button>
	</div>
</div>

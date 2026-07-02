<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { sdk } from '$lib/sdk';
	import {
		accountGroup,
		firstPartyGroups,
		entityGroupsFromScopeEntities,
		catalogScopeSet,
		type ScopeGroup,
	} from '$lib/scopes';
	import { clientDraft, toggleScope, hasScope, addCustomScopes } from '$lib/clientWizard.svelte';
	import PlusIcon from 'phosphor-svelte/lib/PlusIcon';
	import XIcon from 'phosphor-svelte/lib/XIcon';

	const orgId = $derived($page.params.id ?? '');

	let orgGroups = $state<ScopeGroup[]>([]);
	let loadingEntities = $state(true);

	// Org-owned database entities become their own scope groups.
	$effect(() => {
		const id = orgId;
		loadingEntities = true;
		sdk.organizations
			.scopeEntities(id)
			.then((entities) => {
				if (orgId !== id) return;
				orgGroups = entityGroupsFromScopeEntities(entities);
				loadingEntities = false;
			})
			.catch(() => {
				loadingEntities = false;
			});
	});

	const groups = $derived<ScopeGroup[]>([accountGroup, ...firstPartyGroups, ...orgGroups]);
	const catalog = $derived(catalogScopeSet(groups));
	// Scopes the user typed by hand that aren't offered as a checkbox.
	const customScopes = $derived(clientDraft.scopes.filter((scope) => !catalog.has(scope)));

	let customInput = $state('');
	function addCustom() {
		if (!customInput.trim()) return;
		addCustomScopes(customInput);
		customInput = '';
	}
</script>

<svelte:head>
	<title>New client · Scopes — NeoWorks</title>
</svelte:head>

<div class="space-y-5">
	<div>
		<h2 class="text-[15px] font-semibold text-default">Scopes</h2>
		<p class="text-[13px] text-dim mt-0.5">
			Pick what this client may access. {clientDraft.scopes.length} selected.
		</p>
	</div>

	<div class="space-y-4">
		{#each groups as group (group.key)}
			<div class="rounded-xl border border-line-faint bg-surface p-4">
				<div class="mb-3">
					<p class="text-[13px] font-medium text-default">{group.label}</p>
					<p class="text-[12px] text-dim mt-0.5">{group.description}</p>
				</div>
				<div class="space-y-2">
					{#each group.options as option (option.scope)}
						<label class="flex items-start gap-3 cursor-pointer">
							<input
								type="checkbox"
								class="mt-0.5 accent-primary"
								checked={hasScope(option.scope)}
								onchange={() => toggleScope(option.scope)}
							/>
							<span class="min-w-0">
								<span class="flex items-center gap-2">
									<span class="text-[13px] text-default">{option.action}</span>
									<span class="font-mono text-[11px] text-dim">{option.scope}</span>
								</span>
								<span class="block text-[12px] text-dim">{option.description}</span>
							</span>
						</label>
					{/each}
				</div>
			</div>
		{/each}

		{#if loadingEntities}
			<div class="skeleton h-16 w-full rounded-xl"></div>
		{/if}
	</div>

	<!-- Custom / third-party scopes -->
	<div class="rounded-xl border border-line-faint bg-surface p-4 space-y-3">
		<div>
			<p class="text-[13px] font-medium text-default">Custom scopes</p>
			<p class="text-[12px] text-dim mt-0.5">
				Add any scope by hand, including third-party references
				(<span class="font-mono">org:entity:action</span>).
			</p>
		</div>
		<div class="flex items-center gap-2">
			<input
				bind:value={customInput}
				onkeydown={(e) => e.key === 'Enter' && addCustom()}
				placeholder="acme:documents:read"
				class="flex-1 h-9 px-3 rounded-lg border border-line bg-surface text-[13px] font-mono text-default placeholder:text-dim focus:outline-none focus:border-primary transition-colors"
			/>
			<button
				class="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-line text-[13px] text-muted hover:text-default hover:border-line-strong transition-colors"
				onclick={addCustom}
			>
				<PlusIcon size={14} /> Add
			</button>
		</div>
		{#if customScopes.length > 0}
			<div class="flex flex-wrap gap-2">
				{#each customScopes as scope (scope)}
					<span class="flex items-center gap-1.5 h-7 pl-2.5 pr-1.5 rounded-full bg-raised border border-line-faint font-mono text-[11px] text-default">
						{scope}
						<button class="text-dim hover:text-red transition-colors" onclick={() => toggleScope(scope)} aria-label="Remove">
							<XIcon size={12} />
						</button>
					</span>
				{/each}
			</div>
		{/if}
	</div>

	<div class="flex items-center justify-between gap-3 pt-2 border-t border-line-faint">
		<button
			class="h-9 px-4 rounded-lg text-[13px] text-muted hover:text-default transition-colors"
			onclick={() => goto(`/dashboard/organizations/${orgId}/clients/new`)}
		>Back</button>
		<button
			class="h-9 px-4 rounded-lg bg-primary text-primary-content text-[13px] font-medium hover:opacity-90 transition-opacity"
			onclick={() => goto(`/dashboard/organizations/${orgId}/clients/new/review`)}
		>Continue</button>
	</div>
</div>

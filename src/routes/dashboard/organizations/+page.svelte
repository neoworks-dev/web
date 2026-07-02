<script lang="ts">
	import { goto } from '$app/navigation';
	import { sdk } from '$lib/sdk';
	import CreateOrganizationWizard from '$lib/components/organizations/CreateOrganizationWizard.svelte';
	import PageHeader from '$lib/components/dashboard/PageHeader.svelte';
	import WidgetCard from '$lib/components/dashboard/WidgetCard.svelte';
	import type { Organization } from '@neoworks-dev/sdk';
	import PlusIcon from 'phosphor-svelte/lib/PlusIcon';
	import BuildingsIcon from 'phosphor-svelte/lib/BuildingsIcon';
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';

	let organizations = $state<Organization[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let showWizard = $state(false);

	sdk.organizations
		.list()
		.then((res) => {
			organizations = res;
			loading = false;
		})
		.catch((e) => {
			error = e?.message ?? 'Failed to load organizations';
			loading = false;
		});

	function open(org: Organization) {
		goto(`/dashboard/organizations/${org.id}/clients`);
	}

	function onCreated(org: Organization) {
		organizations = [...organizations, org];
		showWizard = false;
		open(org);
	}

	function initials(name: string): string {
		return name
			.split(' ')
			.map((part) => part[0])
			.slice(0, 2)
			.join('')
			.toUpperCase();
	}
</script>

<svelte:head>
	<title>Organizations — NeoWorks</title>
</svelte:head>

<div class="h-full overflow-y-auto space-y-2">
	<PageHeader title="Organizations" subtitle="Organizations own clients and are billed for their usage.">
		{#snippet actions()}
			<button
				class="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-content text-[13px] font-medium hover:opacity-90 transition-opacity"
				onclick={() => (showWizard = true)}
			>
				<PlusIcon size={15} />
				New organization
			</button>
		{/snippet}
	</PageHeader>

	<WidgetCard title="Organizations" subtitle="Organizations you own or belong to." icon={BuildingsIcon}>
		<div class="p-4">
			{#if loading}
				<div class="space-y-2">
					{#each { length: 2 } as _}
						<div class="skeleton h-20 w-full rounded-xl"></div>
					{/each}
				</div>
			{:else if error}
				<div class="rounded-xl border border-red/30 bg-red-soft px-5 py-4 text-[13px] text-red">{error}</div>
			{:else if organizations.length === 0}
				<div class="flex flex-col items-center justify-center py-16 text-center">
					<BuildingsIcon size={32} class="text-dim mb-3" />
					<p class="text-[14px] font-medium text-muted">No organizations yet</p>
					<p class="text-[13px] text-dim mt-1">Create your first organization to start owning clients.</p>
				</div>
			{:else}
				<div class="space-y-2">
					{#each organizations as org (org.id)}
						<button
							class="w-full flex items-center gap-4 rounded-xl border border-line-faint bg-surface p-4 text-left hover:border-line-strong transition-colors group"
							onclick={() => open(org)}
						>
							{#if org.logo_url}
								<img src={org.logo_url} alt={org.name} class="w-11 h-11 rounded-lg object-cover border border-line-faint shrink-0" />
							{:else}
								<div class="w-11 h-11 rounded-lg bg-raised border border-line-faint flex items-center justify-center text-[13px] font-semibold text-muted shrink-0">
									{initials(org.name)}
								</div>
							{/if}
							<div class="min-w-0 flex-1">
								<p class="text-[14px] font-medium text-default truncate">{org.name}</p>
								<p class="text-[12px] text-dim truncate">
									{org.description || `${org.slug}`}
								</p>
							</div>
							<CaretRightIcon size={16} class="text-dim group-hover:text-default transition-colors shrink-0" />
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</WidgetCard>
</div>

{#if showWizard}
	<CreateOrganizationWizard oncancel={() => (showWizard = false)} oncreated={onCreated} />
{/if}

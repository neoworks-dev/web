<script lang="ts">
	import { sdk } from '$lib/sdk';
	import type { Organization } from '@neoworks-dev/sdk';
	import BuildingsIcon from 'phosphor-svelte/lib/BuildingsIcon';
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';

	let organizations = $state<Organization[]>([]);
	let loading = $state(true);

	sdk.organizations
		.list()
		.then((res) => {
			organizations = res;
			loading = false;
		})
		.catch(() => (loading = false));

	function initials(name: string): string {
		return name
			.split(' ')
			.map((part) => part[0])
			.slice(0, 2)
			.join('')
			.toUpperCase();
	}
</script>

<div class="p-4">
	{#if loading}
		<div class="space-y-2">
			{#each { length: 3 } as _}<div class="skeleton h-12 w-full rounded-lg"></div>{/each}
		</div>
	{:else if organizations.length === 0}
		<div class="flex flex-col items-center justify-center py-10 text-center">
			<BuildingsIcon size={28} class="text-dim mb-3" />
			<p class="text-[13px] font-medium text-muted">No organizations yet</p>
			<a href="/dashboard/organizations" class="text-[12px] text-primary hover:underline mt-1">Create one</a>
		</div>
	{:else}
		<div class="space-y-2">
			{#each organizations as org (org.id)}
				<a
					href={`/dashboard/organizations/${org.id}/clients`}
					class="group flex items-center gap-3 rounded-lg border border-line-faint bg-surface p-3 hover:border-line-strong transition-colors"
				>
					{#if org.logo_url}
						<img src={org.logo_url} alt={org.name} class="w-8 h-8 rounded-md object-cover border border-line-faint shrink-0" />
					{:else}
						<div class="w-8 h-8 rounded-md bg-raised border border-line-faint flex items-center justify-center text-[11px] font-semibold text-muted shrink-0">
							{initials(org.name)}
						</div>
					{/if}
					<div class="min-w-0 flex-1">
						<p class="text-[13px] font-medium text-default truncate">{org.name}</p>
						<p class="text-[11px] text-dim truncate">{org.description || org.slug}</p>
					</div>
					<CaretRightIcon size={14} class="text-dim group-hover:text-default transition-colors shrink-0" />
				</a>
			{/each}
		</div>
	{/if}
</div>

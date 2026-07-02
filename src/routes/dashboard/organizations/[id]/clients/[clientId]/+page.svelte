<script lang="ts">
	import { page } from '$app/stores';
	import PageHeader from '$lib/components/dashboard/PageHeader.svelte';
	import { recordRecentClient } from '$lib/recentClients';
	import DatabaseIcon from 'phosphor-svelte/lib/DatabaseIcon';
	import RocketLaunchIcon from 'phosphor-svelte/lib/RocketLaunchIcon';
	import StackIcon from 'phosphor-svelte/lib/StackIcon';
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';

	const orgId = $derived($page.params.id ?? '');
	const clientId = $derived($page.params.clientId ?? '');
	const base = $derived(`/dashboard/organizations/${orgId}/clients/${clientId}`);

	// Track the client in the "recently accessed" list shown on the dashboard.
	$effect(() => {
		if (clientId) recordRecentClient({ id: clientId, name: clientId, orgId });
	});

	const features = $derived([
		{ href: `${base}/databases`,    label: 'Databases',    description: 'SurrealDB instances for this client.', Icon: DatabaseIcon },
		{ href: `${base}/deployments`,  label: 'Deployments',  description: 'Recent and active deployments.',       Icon: RocketLaunchIcon },
		{ href: `${base}/environments`, label: 'Environments', description: 'Deployment environments.',              Icon: StackIcon },
	]);
</script>

<svelte:head>
	<title>{clientId} — NeoWorks</title>
</svelte:head>

<div class="h-full overflow-y-auto space-y-2">
	<PageHeader title={clientId} subtitle="Client overview — databases, deployments and environments." />

	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 items-start">
		{#each features as feature (feature.href)}
			{@const Icon = feature.Icon}
			<a
				href={feature.href}
				class="group flex items-center gap-3 rounded-xl border border-line-faint bg-elevated p-5 hover:border-line-strong transition-colors"
			>
				<div class="w-10 h-10 rounded-lg bg-surface border border-line-faint flex items-center justify-center text-muted shrink-0">
					<Icon size={18} />
				</div>
				<div class="min-w-0 flex-1">
					<p class="text-[14px] font-medium text-default">{feature.label}</p>
					<p class="text-[12px] text-dim truncate">{feature.description}</p>
				</div>
				<CaretRightIcon size={16} class="text-dim group-hover:text-default transition-colors shrink-0" />
			</a>
		{/each}
	</div>
</div>

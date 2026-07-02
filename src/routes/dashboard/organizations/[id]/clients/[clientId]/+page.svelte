<script lang="ts">
	import { page } from '$app/stores';
	import PageHeader from '$lib/components/dashboard/PageHeader.svelte';
	import MetricCard from '$lib/components/dashboard/MetricCard.svelte';
	import ActiveUsersMap from '$lib/components/dashboard/ActiveUsersMap.svelte';
	import { recordRecentClient } from '$lib/recentClients';
	import DatabaseIcon from 'phosphor-svelte/lib/DatabaseIcon';
	import RocketLaunchIcon from 'phosphor-svelte/lib/RocketLaunchIcon';
	import StackIcon from 'phosphor-svelte/lib/StackIcon';
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';

	const orgId = $derived($page.params.id ?? '');
	const clientId = $derived($page.params.clientId ?? '');
	const base = $derived(`/dashboard/organizations/${orgId}/clients/${clientId}`);

	// Deterministic placeholder series (no randomness → stable across SSR/hydrate).
	function trend(n: number, start: number, end: number, amp: number): number[] {
		return Array.from({ length: n }, (_, i) => {
			const t = n === 1 ? 1 : i / (n - 1);
			return Math.round(start + (end - start) * t + Math.sin(i * 1.7) * amp);
		});
	}

	const euros = (n: number) => `€${n.toLocaleString()}`;

	// Placeholder live geo distribution of active users.
	const activeTotal = 346;
	const activeByCountry = [
		{ code: 'US', name: 'United States', value: 128 },
		{ code: 'IN', name: 'India', value: 74 },
		{ code: 'GB', name: 'United Kingdom', value: 52 },
		{ code: 'AU', name: 'Australia', value: 38 },
		{ code: 'CA', name: 'Canada', value: 29 },
	];

	// Placeholder metrics for the client dashboard. Wire to real usage / billing
	// data once the metering + revenue queries exist.
	const metrics = [
		{
			label: 'Active users',
			tone: 'blue' as const,
			stats: [
				{ label: 'Daily active', value: '412' },
				{ label: 'Peak', value: '1,310' },
				{ label: 'Avg session', value: '6m 40s' },
			],
			ranges: [
				{ key: '7d', label: '7D', value: '1,284', delta: '+2.1%', caption: 'vs prev 7d', series: trend(7, 1200, 1284, 25) },
				{ key: '30d', label: '30D', value: '1,284', delta: '+8.2%', caption: 'vs prev 30d', series: trend(30, 1050, 1284, 40) },
				{ key: '12m', label: '12M', value: '1,284', delta: '+34%', caption: 'vs last year', series: trend(12, 820, 1284, 45) },
			],
		},
		{
			label: 'Overall users',
			tone: 'violet' as const,
			stats: [
				{ label: 'New (30d)', value: '312' },
				{ label: 'Churned', value: '48' },
				{ label: 'Verified', value: '91%' },
			],
			ranges: [
				{ key: '7d', label: '7D', value: '8,392', delta: '+0.9%', caption: 'vs prev 7d', series: trend(7, 8280, 8392, 20) },
				{ key: '30d', label: '30D', value: '8,392', delta: '+3.1%', caption: 'vs prev 30d', series: trend(30, 8080, 8392, 30) },
				{ key: '12m', label: '12M', value: '8,392', delta: '+61%', caption: 'vs last year', series: trend(12, 5200, 8392, 60) },
			],
		},
		{
			label: 'Revenue',
			tone: 'green' as const,
			format: euros,
			stats: [
				{ label: 'MRR', value: '€3,980' },
				{ label: 'ARPU', value: '€3.28' },
				{ label: 'Refunds', value: '€120' },
			],
			ranges: [
				{ key: '7d', label: '7D', value: '€1,040', delta: '+4.5%', caption: 'this week', series: trend(7, 820, 1040, 60) },
				{ key: '30d', label: '30D', value: '€4,210', delta: '+12.4%', caption: 'this month', series: trend(30, 2600, 4210, 180) },
				{ key: '12m', label: '12M', value: '€38,600', delta: '+47%', caption: 'this year', series: trend(12, 1800, 4210, 200) },
			],
		},
	];

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

	<div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
		{#each metrics as metric (metric.label)}
			<MetricCard
				label={metric.label}
				ranges={metric.ranges}
				stats={metric.stats}
				tone={metric.tone}
				format={metric.format}
			/>
		{/each}
	</div>

	<ActiveUsersMap total={activeTotal} countries={activeByCountry} />

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

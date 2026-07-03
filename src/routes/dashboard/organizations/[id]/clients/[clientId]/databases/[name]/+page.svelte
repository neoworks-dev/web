<script lang="ts">
	import { page } from '$app/stores';
	import ArrowLeftIcon from 'phosphor-svelte/lib/ArrowLeftIcon';
	import ChartLineIcon from 'phosphor-svelte/lib/ChartLineIcon';
	import PageHeader from '$lib/components/dashboard/PageHeader.svelte';
	import MetricCard from '$lib/components/dashboard/MetricCard.svelte';
	import { sdk } from '$lib/sdk';
	import type { DatabaseUsage } from '@neoworks-dev/sdk';

	const orgId = $derived($page.params.id ?? '');
	const clientId = $derived($page.params.clientId ?? '');
	const name = $derived($page.params.name ?? '');
	const databasesHref = $derived(`/dashboard/organizations/${orgId}/clients/${clientId}/databases`);

	const windows = [
		{ label: '1h', minutes: 60 },
		{ label: '6h', minutes: 360 },
		{ label: '24h', minutes: 1440 },
	];
	let windowMinutes = $state(60);

	let usage = $state<DatabaseUsage | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	// Re-fetch when the client, database, or selected window changes, then poll so
	// the gauges track the metering ticker (~1 min) without a manual refresh.
	$effect(() => {
		const id = clientId;
		const dbName = name;
		const minutes = windowMinutes;
		if (!id || !dbName) return;

		let cancelled = false;
		async function load() {
			try {
				const res = await sdk.databases.usage(id, dbName, { sinceMinutes: minutes });
				if (cancelled) return;
				usage = res;
				error = null;
			} catch (err) {
				if (cancelled) return;
				error = err instanceof Error ? err.message : 'Failed to load usage';
			} finally {
				if (!cancelled) loading = false;
			}
		}

		loading = true;
		load();
		const timer = setInterval(load, 30_000);
		return () => {
			cancelled = true;
			clearInterval(timer);
		};
	});

	function formatBytes(bytes: number): string {
		if (bytes <= 0) return '0 B';
		const units = ['B', 'KB', 'MB', 'GB', 'TB'];
		let value = bytes;
		let unit = 0;
		while (value >= 1024 && unit < units.length - 1) {
			value = value / 1024;
			unit++;
		}
		const decimals = value >= 100 || unit === 0 ? 0 : 1;
		return `${value.toFixed(decimals)} ${units[unit]}`;
	}

	function formatPercent(value: number): string {
		return `${value.toFixed(1)}%`;
	}

	function formatMs(value: number): string {
		return `${value.toFixed(1)} ms`;
	}

	function formatInt(value: number): string {
		return Math.round(value).toLocaleString();
	}

	function seriesOf<T>(items: T[] | undefined, pick: (item: T) => number): number[] {
		if (!items) return [];
		return items.map(pick);
	}

	const instanceSeries = $derived(usage?.instanceSeries ?? []);
	const querySeries = $derived(usage?.querySeries ?? []);
	const current = $derived(usage?.current);
	const hasData = $derived(instanceSeries.length > 0 || querySeries.length > 0);
</script>

<svelte:head>
	<title>{name} usage — NeoWorks</title>
</svelte:head>

<div class="h-full overflow-y-auto space-y-2">
	<PageHeader
		title="{name} · Usage"
		subtitle="CPU, memory and storage reflect the shared org instance hosting this database. Query stats are specific to this database."
	>
		{#snippet actions()}
			<div class="flex items-center gap-2">
				<div class="flex items-center gap-0.5 rounded-md bg-surface border border-line-faint p-0.5">
					{#each windows as w (w.minutes)}
						<button
							type="button"
							onclick={() => (windowMinutes = w.minutes)}
							class="px-2 h-6 rounded text-[11px] font-medium transition-colors
								{windowMinutes === w.minutes ? 'bg-raised text-default' : 'text-dim hover:text-muted'}"
						>{w.label}</button>
					{/each}
				</div>
				<a
					href={databasesHref}
					class="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-medium border border-line-faint bg-surface text-muted hover:text-default hover:border-line-strong transition-colors"
				>
					<ArrowLeftIcon size={13} />
					Databases
				</a>
			</div>
		{/snippet}
	</PageHeader>

	{#if error}
		<div class="rounded-xl border border-red/30 bg-red-soft px-4 py-3 text-[13px] text-red">
			{error}
		</div>
	{/if}

	{#if loading && !usage}
		<div class="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
			{#each { length: 6 } as _}
				<div class="skeleton h-44 w-full rounded-xl"></div>
			{/each}
		</div>
	{:else if current}
		{#if !hasData}
			<div class="rounded-xl border border-line-faint bg-elevated px-4 py-3 flex items-center gap-2 text-[12px] text-dim">
				<ChartLineIcon size={15} />
				No samples collected yet — metrics appear once the instance has been sampled.
			</div>
		{/if}

		<div class="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
			<MetricCard
				label="CPU"
				tone="blue"
				format={formatPercent}
				ranges={[{ key: 'cpu', label: '', value: formatPercent(current.cpu_percent), series: seriesOf(instanceSeries, (s) => s.cpu_percent) }]}
			/>
			<MetricCard
				label="Memory"
				tone="violet"
				format={formatBytes}
				ranges={[{ key: 'mem', label: '', value: formatBytes(current.mem_bytes), caption: formatPercent(current.mem_percent), series: seriesOf(instanceSeries, (s) => s.mem_bytes) }]}
			/>
			<MetricCard
				label="Storage"
				tone="green"
				format={formatBytes}
				ranges={[{ key: 'storage', label: '', value: formatBytes(current.storage_bytes), series: seriesOf(instanceSeries, (s) => s.storage_bytes) }]}
			/>
			<MetricCard
				label="Avg query time"
				tone="blue"
				format={formatMs}
				ranges={[{ key: 'latency', label: '', value: formatMs(current.avg_latency_ms), series: seriesOf(querySeries, (s) => s.avg_latency_ms) }]}
			/>
			<MetricCard
				label="Active connections"
				tone="violet"
				format={formatInt}
				ranges={[{ key: 'conns', label: '', value: formatInt(current.active_connections), series: seriesOf(querySeries, (s) => s.active_connections) }]}
			/>
			<MetricCard
				label="Queries / sample"
				tone="green"
				format={formatInt}
				ranges={[{ key: 'queries', label: '', value: formatInt(current.query_count), series: seriesOf(querySeries, (s) => s.query_count) }]}
			/>
		</div>
	{/if}
</div>

<script lang="ts">
	import { Card } from '@neoworks-dev/ui';
	import MetricCard from '$lib/components/dashboard/MetricCard.svelte';
	import WidgetCard from '$lib/components/dashboard/WidgetCard.svelte';
	import { formatBytes } from '$lib/developer/appFields';
	import { missingPermissionText } from '$lib/developer/permissions';
	import ChartLineIcon from 'phosphor-svelte/lib/ChartLineIcon';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function metric(label: string, total: number, series: number[], tone: 'blue' | 'green' | 'violet') {
		return {
			label,
			tone,
			ranges: [{ key: '30d', label: '30 days', value: total.toLocaleString(), series }],
		};
	}

	const metrics = $derived.by(() => {
		if (data.usage === null) {
			return [];
		}
		const { totals, series } = data.usage;
		return [
			metric('Authorized users', totals.authorizedUsers, series.map((point) => point.authorizedUsers), 'blue'),
			metric('Active installs', totals.activeInstalls, series.map((point) => point.activeInstalls), 'green'),
			metric('Requests', totals.requests, series.map((point) => point.requests), 'violet'),
			metric('Rate-limited requests', totals.rateLimited, series.map((point) => point.rateLimited), 'blue'),
		];
	});
</script>

<WidgetCard title="Usage" subtitle="Aggregate numbers for the last 30 days. Never which users." icon={ChartLineIcon}>
	{#if data.usage === null}
		<p class="p-4 text-sm text-dim">{missingPermissionText('usage.view')} to see this app's usage.</p>
	{:else}
		<div class="grid grid-cols-1 gap-2 p-4 md:grid-cols-2" data-testid="usage">
			{#each metrics as item (item.label)}
				<MetricCard label={item.label} ranges={item.ranges} tone={item.tone} />
			{/each}
			<Card surface="elevated" padding="lg">
				<p class="text-[12px] font-medium uppercase tracking-caps text-dim">Storage</p>
				<p class="mt-3 text-[24px] font-semibold leading-none text-default">{formatBytes(data.usage.totals.storageBytes)}</p>
			</Card>
		</div>
	{/if}
</WidgetCard>

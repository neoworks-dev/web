<script lang="ts">
	// A metric panel: a headline value, a selectable time range, its trend as a
	// hoverable sparkline, and a row of supporting sub-stats.
	export interface MetricRange {
		key: string;
		label: string;
		value: string;
		delta?: string | null;
		caption?: string | null;
		series: number[];
	}

	let {
		label,
		ranges,
		stats = [],
		tone = 'blue',
		format = (n: number) => n.toLocaleString(),
	}: {
		label: string;
		ranges: MetricRange[];
		stats?: { label: string; value: string }[];
		tone?: 'blue' | 'green' | 'violet';
		format?: (n: number) => string;
	} = $props();

	// Null until the user picks a range; falls back to the first range.
	let selectedKey = $state<string | null>(null);
	const current = $derived(ranges.find((r) => r.key === selectedKey) ?? ranges[0]);
	const series = $derived(current?.series ?? []);

	const WIDTH = 100;
	const HEIGHT = 40;

	const points = $derived.by(() => {
		if (series.length === 0) return [];
		const min = Math.min(...series);
		const max = Math.max(...series);
		const span = max - min || 1;
		return series.map((v, i) => {
			const x = series.length === 1 ? WIDTH : (i / (series.length - 1)) * WIDTH;
			const y = HEIGHT - 2 - ((v - min) / span) * (HEIGHT - 4);
			return { x, y };
		});
	});

	const linePath = $derived(points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' '));
	const areaPath = $derived(points.length ? `${linePath} L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z` : '');

	const toneClass = $derived(
		tone === 'green' ? 'text-green' : tone === 'violet' ? 'text-violet' : 'text-blue',
	);

	// ── Hover ────────────────────────────────────────────────────────────────
	let hoverIndex = $state<number | null>(null);

	function onMove(event: PointerEvent) {
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const ratio = (event.clientX - rect.left) / rect.width;
		const count = series.length;
		if (count < 2) return;
		hoverIndex = Math.max(0, Math.min(count - 1, Math.round(ratio * (count - 1))));
	}

	const hover = $derived.by(() => {
		if (hoverIndex === null || !points[hoverIndex]) return null;
		return {
			x: points[hoverIndex].x,
			y: (points[hoverIndex].y / HEIGHT) * 100,
			value: format(series[hoverIndex]),
		};
	});
</script>

<div class="rounded-xl border border-line-faint bg-elevated p-5 flex flex-col gap-3">
	<div class="flex items-center justify-between gap-3">
		<p class="text-[12px] font-medium text-dim uppercase tracking-caps">{label}</p>
		{#if ranges.length > 1}
			<div class="flex items-center gap-0.5 rounded-md bg-surface border border-line-faint p-0.5">
				{#each ranges as range (range.key)}
					<button
						type="button"
						onclick={() => (selectedKey = range.key)}
						class="px-1.5 h-5 rounded text-[11px] font-medium transition-colors
							{current?.key === range.key ? 'bg-raised text-default' : 'text-dim hover:text-muted'}"
					>{range.label}</button>
				{/each}
			</div>
		{/if}
	</div>

	<div class="flex items-baseline gap-2">
		<p class="text-[24px] font-semibold text-default leading-none">{current?.value}</p>
		{#if current?.delta}
			<span class="text-[11px] font-medium text-green">{current.delta}</span>
		{/if}
		{#if current?.caption}
			<span class="text-[11px] text-dim">{current.caption}</span>
		{/if}
	</div>

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="relative {toneClass} -mx-1"
		onpointermove={onMove}
		onpointerleave={() => (hoverIndex = null)}
	>
		<svg viewBox="0 0 {WIDTH} {HEIGHT}" preserveAspectRatio="none" class="w-full h-12 overflow-visible">
			{#if areaPath}
				<path d={areaPath} fill="currentColor" opacity="0.12" />
				<path d={linePath} fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" />
			{/if}
		</svg>

		{#if hover}
			<!-- Guide line -->
			<div class="absolute top-0 bottom-0 w-px bg-current opacity-40 pointer-events-none" style="left: {hover.x}%"></div>
			<!-- Point marker -->
			<div
				class="absolute w-2 h-2 rounded-full bg-current border-2 border-elevated -translate-x-1/2 -translate-y-1/2 pointer-events-none"
				style="left: {hover.x}%; top: {hover.y}%"
			></div>
			<!-- Value tooltip -->
			<div
				class="absolute -top-1 -translate-x-1/2 -translate-y-full px-1.5 py-0.5 rounded bg-raised border border-line-faint text-[11px] font-medium text-default whitespace-nowrap pointer-events-none"
				style="left: {hover.x}%"
			>{hover.value}</div>
		{/if}
	</div>

	{#if stats.length}
		<div class="grid grid-cols-3 gap-2 pt-3 border-t border-line-faint">
			{#each stats as stat (stat.label)}
				<div class="min-w-0">
					<p class="text-[13px] font-medium text-default truncate">{stat.value}</p>
					<p class="text-[11px] text-dim truncate">{stat.label}</p>
				</div>
			{/each}
		</div>
	{/if}
</div>

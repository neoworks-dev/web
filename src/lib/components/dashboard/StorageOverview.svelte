<script lang="ts">
	import { slide } from 'svelte/transition';
	import { sdk } from '$lib/sdk';
	import ImageIcon from 'phosphor-svelte/lib/ImageIcon';
	import VideoIcon from 'phosphor-svelte/lib/VideoIcon';
	import FileTextIcon from 'phosphor-svelte/lib/FileTextIcon';
	import ArchiveIcon from 'phosphor-svelte/lib/ArchiveIcon';
	import TrendUpIcon from 'phosphor-svelte/lib/TrendUpIcon';
	import TrendDownIcon from 'phosphor-svelte/lib/TrendDownIcon';
	import CurrencyDollarIcon from 'phosphor-svelte/lib/CurrencyDollarIcon';
	import CaretDownIcon from 'phosphor-svelte/lib/CaretDownIcon';
	import FireIcon from 'phosphor-svelte/lib/FireIcon';
	import SnowflakeIcon from 'phosphor-svelte/lib/SnowflakeIcon';
	import MountainsIcon from 'phosphor-svelte/lib/MountainsIcon';
	import type { Component } from 'svelte';

	type SpanId = '7d' | '30d' | '90d' | '1y';

	const spans: { id: SpanId; label: string; days: number }[] = [
		{ id: '7d', label: '7D', days: 7 },
		{ id: '30d', label: '30D', days: 30 },
		{ id: '90d', label: '90D', days: 90 },
		{ id: '1y', label: '1Y', days: 365 },
	];

	// Server returns decimal bytes; the widget works in GB throughout.
	const BYTES_PER_GB = 1_000_000_000;

	// Display metadata keyed by the server's category/tier enums.
	type Meta = { label: string; color: string; Icon: Component };
	const categoryMeta: Record<string, Meta> = {
		photos: { label: 'Photos', color: 'var(--ctx-blue)', Icon: ImageIcon },
		videos: { label: 'Videos', color: 'var(--ctx-violet)', Icon: VideoIcon },
		documents: { label: 'Documents', color: 'var(--ctx-green)', Icon: FileTextIcon },
		other: { label: 'Other', color: 'var(--ctx-amber)', Icon: ArchiveIcon },
	};
	const tierMeta: Record<string, Meta & { desc: string }> = {
		hot: { label: 'Hot', desc: 'Frequently accessed', color: 'var(--ctx-red)', Icon: FireIcon },
		cold: { label: 'Cold', desc: 'Infrequently accessed', color: 'var(--ctx-blue)', Icon: SnowflakeIcon },
		archive: { label: 'Archive', desc: 'Archival, retrieval delay', color: 'var(--ctx-violet)', Icon: MountainsIcon },
	};

	let span = $state<SpanId>('30d');
	let showBreakdown = $state(false);

	type Usage = Awaited<ReturnType<typeof sdk.storage.usage>>;
	let usage = $state<Usage | null>(null);
	let loading = $state(true);

	// Object storage is pay-as-you-go (no quota), billed per GB/month; the server
	// caches this breakdown for 15 minutes.
	sdk.storage
		.usage()
		.then((res) => {
			usage = res;
			loading = false;
		})
		.catch(() => {
			loading = false;
		});

	const used = $derived(usage ? usage.totalBytes / BYTES_PER_GB : 0);

	const categories = $derived.by(() => {
		const out: { label: string; size: number; color: string; Icon: Component }[] = [];
		if (!usage) return out;
		for (const entry of usage.categories) {
			const meta = categoryMeta[entry.category];
			if (!meta) continue;
			const size = entry.bytes / BYTES_PER_GB;
			if (size <= 0) continue;
			out.push({ label: meta.label, color: meta.color, Icon: meta.Icon, size });
		}
		return out;
	});

	// Total of the rendered categories, used for the proportion bar.
	const categoriesTotal = $derived(categories.reduce((sum, c) => sum + c.size, 0));

	const tiers = $derived.by(() => {
		const out: { label: string; desc: string; size: number; pricePerGb: number; color: string; Icon: Component }[] = [];
		if (!usage) return out;
		for (const entry of usage.tiers) {
			const meta = tierMeta[entry.tier];
			if (!meta) continue;
			out.push({
				label: meta.label,
				desc: meta.desc,
				color: meta.color,
				Icon: meta.Icon,
				size: entry.bytes / BYTES_PER_GB,
				pricePerGb: entry.unitPricePerGbMonth,
			});
		}
		return out;
	});

	const currency = $derived(usage && usage.tiers.length > 0 ? usage.tiers[0].currency : 'USD');
	const monthlyCost = $derived(tiers.reduce((sum, t) => sum + t.size * t.pricePerGb, 0));

	const history = $derived.by(() => {
		const out: { date: Date; value: number }[] = [];
		if (!usage) return out;
		for (const point of usage.history) {
			out.push({ date: new Date(point.date), value: point.bytes / BYTES_PER_GB });
		}
		return out;
	});

	const points = $derived.by(() => {
		const days = spans.find((s) => s.id === span)!.days;
		let slice = history.slice(-(days + 1));
		if (slice.length > 60) {
			// downsample to weekly buckets for long ranges
			const sampled: typeof slice = [];
			for (let i = 0; i < slice.length; i += 7) sampled.push(slice[i]);
			sampled.push(slice[slice.length - 1]);
			slice = sampled;
		}
		return slice;
	});

	const delta = $derived(points.length > 1 ? points[points.length - 1].value - points[0].value : 0);

	const PAD_Y = 8; // % padding top/bottom inside the chart

	const chart = $derived.by(() => {
		const values = points.map((p) => p.value);
		const max = Math.max(...values);
		const min = Math.min(...values);
		const range = max - min || 1;
		const coords = points.map((p, i) => ({
			x: points.length > 1 ? (i / (points.length - 1)) * 100 : 50,
			y: PAD_Y + (1 - (p.value - min) / range) * (100 - PAD_Y * 2),
			date: p.date,
			value: p.value,
		}));
		return { coords, max, min };
	});

	function smoothPath(coords: { x: number; y: number }[]): string {
		if (coords.length === 0) return '';
		if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;
		let d = `M ${coords[0].x} ${coords[0].y}`;
		for (let i = 1; i < coords.length; i++) {
			const prev = coords[i - 1];
			const curr = coords[i];
			const cx = (prev.x + curr.x) / 2;
			d += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
		}
		return d;
	}

	const linePath = $derived(smoothPath(chart.coords));
	const areaPath = $derived(chart.coords.length ? `${linePath} L 100 100 L 0 100 Z` : '');

	let chartEl = $state<HTMLDivElement>();
	let hover = $state<number | null>(null);

	const tooltipX = $derived(hover !== null ? Math.min(94, Math.max(6, chart.coords[hover].x)) : 0);

	function onPointerMove(e: PointerEvent) {
		if (!chartEl || chart.coords.length === 0) return;
		const rect = chartEl.getBoundingClientRect();
		const rel = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
		hover = Math.round(rel * (chart.coords.length - 1));
	}

	function fmtSize(v: number): string {
		if (v >= 1000) return `${(v / 1000).toFixed(2)} TB`;
		return `${v.toFixed(1)} GB`;
	}

	function currencySymbol(code: string): string {
		if (code === 'USD') return '$';
		if (code === 'EUR') return '€';
		if (code === 'GBP') return '£';
		return `${code} `;
	}

	function fmtCost(v: number): string {
		return `${currencySymbol(currency)}${v.toFixed(2)}`;
	}

	function fmtDate(d: Date): string {
		return d.toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: span === '1y' ? '2-digit' : undefined,
		});
	}
</script>

<div class="p-6 space-y-5">
	<div class="flex items-end justify-between">
		<div>
			<p class="text-[11px] font-semibold text-dim uppercase tracking-caps mb-1">Total used</p>
			<p class="font-mono text-2xl font-semibold text-default tabular-nums">{loading ? '—' : fmtSize(used)}</p>
		</div>
		<div class="text-right shrink-0">
			<p class="text-[11px] font-semibold text-dim uppercase tracking-caps mb-1">Est. cost</p>
			<button
				type="button"
				onclick={() => (showBreakdown = !showBreakdown)}
				class="flex items-center justify-end gap-1.5 font-mono text-[15px] font-semibold text-default cursor-pointer"
			>
				<CurrencyDollarIcon size={13} class="text-dim" />
				{loading ? '—' : `${fmtCost(monthlyCost)}/mo`}
				<CaretDownIcon size={11} class="text-dim transition-transform duration-fast {showBreakdown ? 'rotate-180' : ''}" />
			</button>
		</div>
	</div>

	<div class="flex gap-6">
		<div class="flex-1 min-w-0 space-y-5">
			<!-- Usage breakdown -->
			<div class="space-y-3">
				<div class="h-1.5 rounded-full bg-raised overflow-hidden flex">
					{#each categories as cat}
						<div style="width: {categoriesTotal > 0 ? (cat.size / categoriesTotal) * 100 : 0}%; background: {cat.color}"></div>
					{/each}
				</div>
				<div class="grid grid-cols-2 gap-3">
					{#each categories as cat}
						<div class="flex items-center gap-2 min-w-0">
							<span class="w-2 h-2 rounded-full shrink-0" style="background: {cat.color}"></span>
							<cat.Icon size={13} class="text-dim shrink-0" />
							<div class="min-w-0">
								<p class="text-[12px] text-default truncate">{cat.label}</p>
								<p class="text-[11px] text-dim font-mono">{fmtSize(cat.size)}</p>
							</div>
						</div>
					{/each}
				</div>
				{#if !loading && categories.length === 0}
					<p class="text-[12px] text-dim">No files stored yet.</p>
				{/if}
			</div>

			<div class="h-px bg-line-faint"></div>

			<!-- Trend chart -->
			<div>
				<div class="flex items-center justify-between mb-3">
					<div class="flex items-center gap-2">
						<p class="text-[13px] font-medium text-default">Usage trend</p>
						<span class="flex items-center gap-1 text-[11px] font-medium {delta >= 0 ? 'text-violet' : 'text-green'}">
							{#if delta >= 0}
								<TrendUpIcon size={12} />
							{:else}
								<TrendDownIcon size={12} />
							{/if}
							{delta >= 0 ? '+' : ''}{fmtSize(delta)}
						</span>
					</div>

					<div class="flex items-center gap-0.5 p-0.5 rounded-lg bg-raised border border-line-faint">
						{#each spans as s}
							<button
								type="button"
								onclick={() => { span = s.id; hover = null; }}
								class="px-2.5 h-6 rounded-md text-[11px] font-medium transition-colors duration-fast
									{span === s.id ? 'bg-elevated text-default shadow-xs' : 'text-dim hover:text-muted'}"
							>
								{s.label}
							</button>
						{/each}
					</div>
				</div>

				<div
					bind:this={chartEl}
					class="relative"
					role="img"
					aria-label="Storage usage trend chart"
					onpointermove={onPointerMove}
					onpointerleave={() => (hover = null)}
				>
					<p class="absolute top-0 right-0 text-[10px] font-mono text-faint">{fmtSize(chart.max)}</p>
					<p class="absolute bottom-0 right-0 text-[10px] font-mono text-faint">{fmtSize(chart.min)}</p>

					<svg viewBox="0 0 100 100" preserveAspectRatio="none" class="w-full h-36 overflow-visible">
						<defs>
							<linearGradient id="storage-fill" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stop-color="var(--ctx-violet)" stop-opacity="0.22" />
								<stop offset="100%" stop-color="var(--ctx-violet)" stop-opacity="0" />
							</linearGradient>
						</defs>
						<path d={areaPath} fill="url(#storage-fill)" />
						<path
							d={linePath}
							fill="none"
							stroke="var(--ctx-violet)"
							stroke-width="1.5"
							stroke-linejoin="round"
							stroke-linecap="round"
							vector-effect="non-scaling-stroke"
						/>
						{#if hover !== null}
							{@const c = chart.coords[hover]}
							<line
								x1={c.x} y1="0" x2={c.x} y2="100"
								stroke="var(--color-line)"
								stroke-width="1"
								stroke-dasharray="2 2"
								vector-effect="non-scaling-stroke"
							/>
							<circle cx={c.x} cy={c.y} r="2.5" fill="var(--ctx-violet)" stroke="var(--bg-elevated)" stroke-width="1.5" vector-effect="non-scaling-stroke" />
						{/if}
					</svg>

					{#if hover !== null}
						{@const c = chart.coords[hover]}
						<div
							class="absolute top-0 -translate-y-full -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg border border-line bg-elevated shadow-md text-[11px] whitespace-nowrap pointer-events-none"
							style="left: {tooltipX}%"
						>
							<p class="font-mono font-semibold text-default">{fmtSize(c.value)}</p>
							<p class="text-dim">{fmtDate(c.date)}</p>
						</div>
					{/if}
				</div>

				{#if points.length > 0}
					<div class="flex justify-between text-[11px] text-dim mt-1.5 font-mono">
						<span>{fmtDate(points[0].date)}</span>
						<span>{fmtDate(points[points.length - 1].date)}</span>
					</div>
				{/if}
			</div>
		</div>

		{#if showBreakdown}
			<div class="flex-1 min-w-0 pl-6 border-l border-line-faint space-y-3" transition:slide={{ axis: 'x', duration: 200 }}>
				<p class="text-[11px] font-semibold text-dim uppercase tracking-caps">Cost by tier</p>
				<div class="space-y-2.5">
					{#each tiers as tier}
						<div class="flex items-start gap-2.5">
							<tier.Icon size={14} color={tier.color} class="shrink-0 mt-0.5" />
							<div class="flex-1 min-w-0">
								<div class="flex items-baseline justify-between gap-2">
									<p class="text-[12px] font-medium text-default">{tier.label}</p>
									<p class="font-mono text-[12px] text-default tabular-nums">{fmtCost(tier.size * tier.pricePerGb)}</p>
								</div>
								<p class="text-[10px] text-dim truncate">{fmtSize(tier.size)} · {currencySymbol(currency)}{tier.pricePerGb.toFixed(4)}/GB · {tier.desc}</p>
							</div>
						</div>
					{/each}
				</div>
				<div class="h-px bg-line-faint"></div>
				<div class="flex items-baseline justify-between">
					<p class="text-[12px] font-semibold text-default">Total</p>
					<p class="font-mono text-[13px] font-semibold text-default tabular-nums">{fmtCost(monthlyCost)}/mo</p>
				</div>
			</div>
		{/if}
	</div>
</div>

<script lang="ts">
	// Dotted world map (real Natural Earth land, rasterized to dots — see
	// $lib/worldDots) with each country tinted from gray toward blue by its share
	// of active users, plus a per-country breakdown on the right.
	import { DOTS, DOT_CODES, VIEW_W, VIEW_H } from '$lib/worldDots';

	export interface CountryStat {
		/** ISO 3166-1 alpha-2 code, e.g. "US". Used for the flag emoji. */
		code: string;
		name: string;
		value: number;
	}

	let {
		total,
		countries,
		label = 'Active users right now',
	}: { total: number; countries: CountryStat[]; label?: string } = $props();

	const GRAY = '#3f3f46';
	const BLUE = '#4f8bff';

	function hexToRgb(hex: string): [number, number, number] {
		const h = hex.replace('#', '');
		return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
	}
	function mix(a: string, b: string, t: number): string {
		const [ar, ag, ab] = hexToRgb(a);
		const [br, bg, bb] = hexToRgb(b);
		const r = Math.round(ar + (br - ar) * t);
		const gg = Math.round(ag + (bg - ag) * t);
		const bl = Math.round(ab + (bb - ab) * t);
		return `rgb(${r},${gg},${bl})`;
	}

	const userByCode = $derived.by(() => {
		const map: Record<string, number> = {};
		for (const c of countries) map[c.code.toUpperCase()] = c.value;
		return map;
	});
	const maxValue = $derived(Math.max(1, ...countries.map((c) => c.value)));

	// Precompute a fill per country index: gray with no users, tinting toward blue
	// with a floor so any active country reads clearly as blue.
	const fillByCode = $derived(
		DOT_CODES.map((code) => {
			const value = userByCode[code] ?? 0;
			if (value <= 0) return GRAY;
			const t = 0.35 + 0.65 * (value / maxValue);
			return mix(GRAY, BLUE, t);
		}),
	);

	function flag(code: string): string {
		return code
			.toUpperCase()
			.replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)));
	}
</script>

<div class="rounded-xl border border-line-faint bg-[#0a0a0b] overflow-hidden flex flex-col md:flex-row">
	<!-- Map -->
	<div class="relative flex-1 min-w-0 p-5">
		<div class="flex items-start justify-between gap-3 absolute inset-x-5 top-4 z-10">
			<p class="text-[13px] font-medium text-white/90">{label}</p>
			<span class="flex items-center gap-1.5 text-[11px] text-white/40">
				<span class="w-1.5 h-1.5 rounded-full bg-green animate-pulse"></span>
				Real-time
			</span>
		</div>

		<svg viewBox="0 0 {VIEW_W} {VIEW_H}" class="w-full h-auto mt-6" role="img" aria-label="World map of active users">
			{#each DOTS as dot}
				<circle cx={dot[0]} cy={dot[1]} r="0.52" fill={fillByCode[dot[2]]} />
			{/each}
		</svg>
	</div>

	<!-- Country breakdown -->
	<div class="shrink-0 md:w-[240px] border-t md:border-t-0 md:border-l border-white/10 p-5 flex flex-col gap-4">
		<p class="text-[28px] font-semibold text-white leading-none">{total.toLocaleString()}</p>
		<div class="flex flex-col gap-3">
			{#each countries as country (country.code)}
				<div class="flex items-center gap-2.5">
					<span class="text-[16px] leading-none w-6 text-center select-none">{flag(country.code)}</span>
					<div class="min-w-0 flex-1">
						<div class="flex items-baseline justify-between gap-2 mb-1">
							<p class="text-[12px] text-white/80 truncate">{country.name}</p>
							<p class="text-[11px] text-white/50 shrink-0 tabular-nums">
								{country.value.toLocaleString()}
								<span class="text-white/35">· {total > 0 ? Math.round((country.value / total) * 100) : 0}%</span>
							</p>
						</div>
						<div class="h-1 rounded-full bg-white/10 overflow-hidden">
							<div class="h-full rounded-full" style="width: {(country.value / maxValue) * 100}%; background-color: {BLUE}"></div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

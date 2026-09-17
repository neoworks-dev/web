<script lang="ts">
	// Stand-in for the develop rail until a screen capture replaces it.
	const lightRows = [
		{ label: 'Exposure', value: '+0.35 EV', knobPercent: 62 },
		{ label: 'Contrast', value: '+12', knobPercent: 58 },
		{ label: 'Highlights', value: '−40', knobPercent: 30 },
		{ label: 'Shadows', value: '+28', knobPercent: 68 },
		{ label: 'Whites', value: '+6', knobPercent: 54 },
		{ label: 'Blacks', value: '−10', knobPercent: 45 }
	];
</script>

<div class="flex flex-col gap-5 p-6">
	<div>
		<span class="font-mono text-[10px] tracking-[0.16em] text-dim uppercase">Histogram</span>
		<svg viewBox="0 0 240 56" class="mt-2 w-full" role="presentation">
			<path
				d="M0 56 L12 40 L22 14 L32 34 L46 8 L58 30 L74 22 L92 36 L112 18 L134 30 L158 12 L182 26 L206 20 L228 34 L240 30 L240 56 Z"
				fill="currentColor"
				class="text-muted/25"
			/>
			<path
				d="M0 56 L12 40 L22 14 L32 34 L46 8 L58 30 L74 22 L92 36 L112 18 L134 30 L158 12 L182 26 L206 20 L228 34 L240 30"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				class="text-muted/70"
			/>
		</svg>
	</div>

	<div class="flex flex-col gap-2.5 border-t border-line-faint pt-4">
		<span class="font-mono text-[10px] tracking-[0.16em] text-dim uppercase">Light</span>
		{#each lightRows as { label, value, knobPercent }}
			<div class="flex items-center gap-3">
				<span class="w-20 shrink-0 text-xs text-muted">{label}</span>
				<span class="relative h-1 flex-1 rounded-full bg-line-faint">
					<span class="absolute inset-y-0 left-1/2 w-px bg-line-strong"></span>
					<span
						class="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-default"
						style="left: {knobPercent}%"
					></span>
				</span>
				<span class="w-16 shrink-0 text-right font-mono text-[11px] text-dim">{value}</span>
			</div>
		{/each}
	</div>

	<div class="border-t border-line-faint pt-4">
		<span class="font-mono text-[10px] tracking-[0.16em] text-dim uppercase">Curve</span>
		<svg viewBox="0 0 120 120" class="mt-2 h-28 w-28" role="presentation">
			<rect width="120" height="120" rx="4" class="fill-elevated" />
			<path d="M40 0V120M80 0V120M0 40H120M0 80H120" stroke="currentColor" stroke-width="0.5" class="text-line-faint" />
			<path d="M0 120 L120 0" stroke="currentColor" stroke-width="0.75" stroke-dasharray="3 3" class="text-line" />
			<path
				d="M0 120 C34 104 52 62 72 40 C88 22 104 12 120 4"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				class="text-default"
			/>
		</svg>
	</div>
</div>

<script lang="ts">
	export type TranscriptPane = {
		label: string;
		/** Plain text, rendered mono and pre-wrapped — real tool output, not markup. */
		body: string;
		/** Two or three headline figures shown along the pane's bottom edge. */
		stats: string[];
	};

	let {
		left,
		right,
		label
	}: {
		left: TranscriptPane;
		right: TranscriptPane;
		label: string;
	} = $props();

	const stepPercent = 4;
	const minPercent = 22;
	const maxPercent = 78;

	let frame = $state<HTMLDivElement>();
	let dragging = $state(false);
	let splitPercent = $state(50);

	function clamp(percent: number) {
		return Math.min(maxPercent, Math.max(minPercent, percent));
	}

	function moveSplitTo(clientX: number) {
		if (!frame) return;
		const bounds = frame.getBoundingClientRect();
		const ratio = (clientX - bounds.left) / bounds.width;
		splitPercent = clamp(ratio * 100);
	}

	function startDrag(event: PointerEvent) {
		dragging = true;
		frame?.setPointerCapture(event.pointerId);
		moveSplitTo(event.clientX);
	}

	function continueDrag(event: PointerEvent) {
		if (!dragging) return;
		moveSplitTo(event.clientX);
	}

	function endDrag() {
		dragging = false;
	}

	function nudge(event: KeyboardEvent) {
		if (event.key === 'ArrowLeft') {
			splitPercent = clamp(splitPercent - stepPercent);
			event.preventDefault();
			return;
		}
		if (event.key === 'ArrowRight') {
			splitPercent = clamp(splitPercent + stepPercent);
			event.preventDefault();
		}
	}
</script>

<!--
	Two transcripts of the same question, each clipped by its own pane rather than
	by a shared clip-path: monospace output cut at a column still reads as output,
	where a clip over two overlaid panes would interleave the lines.
	Below md the panes stack and the handle goes away — a 50% column of terminal
	output on a phone is unreadable at any split.
-->
<div
	bind:this={frame}
	role="slider"
	tabindex="0"
	aria-label={label}
	aria-valuemin={minPercent}
	aria-valuemax={maxPercent}
	aria-valuenow={Math.round(splitPercent)}
	aria-valuetext="{Math.round(splitPercent)}% {left.label}"
	class="split relative overflow-hidden rounded-2xl border border-line bg-[#0b0d10] focus-visible:ring-2 focus-visible:ring-accent focus:outline-none md:cursor-ew-resize md:touch-none md:select-none"
	style="--split: {splitPercent}%"
	onpointerdown={startDrag}
	onpointermove={continueDrag}
	onpointerup={endDrag}
	onpointercancel={endDrag}
	onkeydown={nudge}
>
	<div class="flex max-md:flex-col">
		<div
			class="pane pane-left flex shrink-0 flex-col overflow-hidden border-white/10 max-md:border-b md:border-r"
		>
			<div class="flex items-center gap-2 px-5 py-3 max-md:px-4">
				<span class="size-1.5 shrink-0 rounded-full bg-[#f0a4a4]"></span>
				<span class="font-mono text-[11px] tracking-[0.14em] whitespace-nowrap text-white/45 uppercase">
					{left.label}
				</span>
			</div>

			<pre
				class="min-w-[36ch] px-5 pb-5 font-mono text-[12.5px] leading-[1.75] whitespace-pre text-white/60 max-md:px-4 md:text-[13px]">{left.body}</pre>

			<div
				class="mt-auto flex flex-wrap gap-x-5 gap-y-1 border-t border-white/10 px-5 py-3 max-md:px-4"
			>
				{#each left.stats as stat}
					<span class="font-mono text-[11.5px] whitespace-nowrap text-white/45">{stat}</span>
				{/each}
			</div>
		</div>

		<div class="pane flex min-w-0 flex-1 flex-col overflow-hidden">
			<div class="flex items-center gap-2 px-5 py-3 max-md:px-4">
				<span class="size-1.5 shrink-0 rounded-full bg-[#86efac]"></span>
				<span class="font-mono text-[11px] tracking-[0.14em] whitespace-nowrap text-white/60 uppercase">
					{right.label}
				</span>
			</div>

			<pre
				class="min-w-[36ch] px-5 pb-5 font-mono text-[12.5px] leading-[1.75] whitespace-pre text-white/80 max-md:px-4 md:text-[13px]">{right.body}</pre>

			<div
				class="mt-auto flex flex-wrap gap-x-5 gap-y-1 border-t border-white/10 px-5 py-3 max-md:px-4"
			>
				{#each right.stats as stat}
					<span class="font-mono text-[11.5px] whitespace-nowrap text-white">{stat}</span>
				{/each}
			</div>
		</div>
	</div>

	<div class="handle pointer-events-none absolute inset-y-0 z-10 w-px bg-white/25 max-md:hidden">
		<span
			class="absolute top-1/2 left-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/70 text-white backdrop-blur-md"
		>
			<svg viewBox="0 0 24 24" class="size-4" fill="currentColor" aria-hidden="true">
				<path d="M10 6 4 12l6 6zM14 6l6 6-6 6z" />
			</svg>
		</span>
	</div>
</div>

<style>
	.pane-left {
		width: var(--split);
	}

	.handle {
		left: var(--split);
	}

	.pane pre {
		scrollbar-width: none;
	}

	@media (max-width: 767px) {
		.pane-left {
			width: 100%;
		}
	}
</style>

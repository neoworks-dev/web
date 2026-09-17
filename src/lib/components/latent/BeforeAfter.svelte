<script lang="ts">
	let {
		before,
		after,
		beforeLabel = 'RAW',
		afterLabel = 'Edited',
		beforeFilter = '',
		alt
	}: {
		before: string;
		after: string;
		beforeLabel?: string;
		afterLabel?: string;
		/** CSS filter applied to the left half, for stand-in pairs cut from one file. */
		beforeFilter?: string;
		alt: string;
	} = $props();

	const stepPercent = 4;

	let frame = $state<HTMLDivElement>();
	let dragging = $state(false);
	let splitPercent = $state(50);

	function moveSplitTo(clientX: number) {
		if (!frame) return;
		const bounds = frame.getBoundingClientRect();
		const ratio = (clientX - bounds.left) / bounds.width;
		splitPercent = clamp(ratio * 100);
	}

	function clamp(percent: number) {
		return Math.min(100, Math.max(0, percent));
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

<div
	bind:this={frame}
	role="slider"
	tabindex="0"
	aria-label="Compare the unedited RAW with the finished edit"
	aria-valuemin={0}
	aria-valuemax={100}
	aria-valuenow={Math.round(splitPercent)}
	aria-valuetext="{Math.round(splitPercent)}% {beforeLabel}"
	class="absolute inset-0 cursor-ew-resize touch-none select-none focus:outline-none"
	onpointerdown={startDrag}
	onpointermove={continueDrag}
	onpointerup={endDrag}
	onpointercancel={endDrag}
	onkeydown={nudge}
>
	<img src={after} {alt} class="absolute inset-0 size-full object-cover" />

	<div
		class="absolute inset-0 overflow-hidden"
		style="clip-path: inset(0 {100 - splitPercent}% 0 0)"
	>
		<img
			src={before}
			alt=""
			aria-hidden="true"
			class="absolute inset-0 size-full object-cover"
			style="filter: {beforeFilter}"
		/>
	</div>

	<div
		class="absolute inset-y-0 w-px bg-white/70 shadow-[0_0_18px_rgba(0,0,0,0.55)]"
		style="left: {splitPercent}%"
	>
		<span
			class="absolute top-1/2 left-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-black/45 text-white backdrop-blur-md"
		>
			<svg viewBox="0 0 24 24" class="size-4" fill="currentColor" aria-hidden="true">
				<path d="M10 6 4 12l6 6zM14 6l6 6-6 6z" />
			</svg>
		</span>
	</div>

	<span
		class="absolute top-6 left-6 rounded-full border border-white/20 bg-black/45 px-3 py-1 font-mono text-[11px] tracking-[0.14em] text-white/80 uppercase backdrop-blur-md max-md:top-4 max-md:left-4"
	>
		{beforeLabel}
	</span>
	<span
		class="absolute top-6 right-6 rounded-full border border-white/20 bg-black/45 px-3 py-1 font-mono text-[11px] tracking-[0.14em] text-white/80 uppercase backdrop-blur-md max-md:top-4 max-md:right-4"
	>
		{afterLabel}
	</span>
</div>

<script lang="ts" module>
	type GalleryTile = {
		depth: number;
		leftPercent: number;
		topPercent: number;
		widthPercent: number;
		aspectRatio: number;
	};

	/**
	 * Every tile comes from its own cell of one shared grid, so two photos can never
	 * pile up on the same spot — depth only decides a tile's size and treatment. The
	 * field is inset so all 36 tiles sit inside the viewport at rest, with only enough
	 * margin that parallax carries the outermost ones a little past the edge.
	 */
	const FIELD_ORIGIN_X_PERCENT = 0;
	const FIELD_SPAN_X_PERCENT = 100;
	const FIELD_ORIGIN_Y_PERCENT = 2;
	const FIELD_SPAN_Y_PERCENT = 86;
	const GRID_COLUMNS = 9;
	const GRID_ROWS = 4;
	const ASPECT_RATIOS = [0.7, 0.8, 1, 1, 1.2, 1.35];
	const SEED = 20260825;

	/** Alternate columns drop half a row, so nothing lines up into visible rows. */
	const COLUMN_STAGGER = 0.5;
	/**
	 * Tile widths are fractions of a cell, so the wall stays equally dense at any
	 * viewport width. Neighbours sit at least `1 - JITTER_FRACTION` cells apart, which
	 * keeps even two adjacent full-width tiles under 35% overlap.
	 */
	const JITTER_FRACTION = 0.28;
	const DEPTH_CUTOFFS = [0.34, 0.62, 0.85];
	const DEPTH_WIDTH_FRACTIONS = [
		{ min: 0.42, max: 0.55 },
		{ min: 0.52, max: 0.66 },
		{ min: 0.62, max: 0.74 },
		{ min: 0.71, max: 0.82 }
	];

	/** mulberry32 — small, fast, stable across engines. */
	function createRandom(seed: number): () => number {
		let state = seed;
		return () => {
			state = (state + 0x6d2b79f5) | 0;
			let value = Math.imul(state ^ (state >>> 15), 1 | state);
			value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
			return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
		};
	}

	function pickDepth(value: number): number {
		if (value < DEPTH_CUTOFFS[0]) return 0;
		if (value < DEPTH_CUTOFFS[1]) return 1;
		if (value < DEPTH_CUTOFFS[2]) return 2;
		return 3;
	}

	function createTile(random: () => number, cellIndex: number): GalleryTile {
		const depth = pickDepth(random());
		const widthFraction = DEPTH_WIDTH_FRACTIONS[depth];
		const cellWidth = FIELD_SPAN_X_PERCENT / GRID_COLUMNS;
		const cellHeight = FIELD_SPAN_Y_PERCENT / GRID_ROWS;
		const column = cellIndex % GRID_COLUMNS;
		const row = Math.floor(cellIndex / GRID_COLUMNS);
		const jitterX = (random() - 0.5) * cellWidth * JITTER_FRACTION;
		const jitterY = (random() - 0.5) * cellHeight * JITTER_FRACTION;
		const stagger = (column % 2) * COLUMN_STAGGER * cellHeight;
		const width = widthFraction.min + random() * (widthFraction.max - widthFraction.min);

		return {
			depth,
			leftPercent: FIELD_ORIGIN_X_PERCENT + (column + 0.5) * cellWidth + jitterX,
			topPercent: FIELD_ORIGIN_Y_PERCENT + (row + 0.5) * cellHeight + stagger + jitterY,
			widthPercent: Number((width * cellWidth).toFixed(2)),
			aspectRatio: ASPECT_RATIOS[Math.floor(random() * ASPECT_RATIOS.length)]
		};
	}

	/**
	 * Generated once at module load from a fixed seed, so the server and the client
	 * render the identical scatter and hydration stays quiet.
	 */
	const gridRandom = createRandom(SEED);
	const gridTiles: GalleryTile[] = Array.from({ length: GRID_COLUMNS * GRID_ROWS }, (unused, cellIndex) =>
		createTile(gridRandom, cellIndex)
	);

	/** Grouped by depth so each group renders with its own treatment and parallax rate. */
	const layerTiles: GalleryTile[][] = DEPTH_WIDTH_FRACTIONS.map((unused, depth) =>
		gridTiles.filter((tile) => tile.depth === depth)
	);
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	/** One path per tile, in order. Tiles past the end of the list stay blank plates. */
	let { images = [] }: { images?: string[] } = $props();

	/** Fraction of the scrolled distance a layer travels, per pixel of pointer parallax. */
	const SCROLL_DEPTH_SCALE = 0.013;

	let pointerX = $state(0);
	let pointerY = $state(0);
	let scrollOffset = $state(0);

	let targetX = 0;
	let targetY = 0;
	let animationFrame = 0;

	function trackPointer(event: PointerEvent): void {
		targetX = (event.clientX / window.innerWidth) * 2 - 1;
		targetY = (event.clientY / window.innerHeight) * 2 - 1;
	}

	function stepParallax(): void {
		pointerX += (targetX - pointerX) * 0.075;
		pointerY += (targetY - pointerY) * 0.075;
		// Clamped to one viewport: past that the hero is gone and the drift is wasted work.
		scrollOffset = Math.min(window.scrollY, window.innerHeight);
		animationFrame = requestAnimationFrame(stepParallax);
	}

	onMount(() => {
		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
		if (reducedMotion.matches) return;

		window.addEventListener('pointermove', trackPointer, { passive: true });
		animationFrame = requestAnimationFrame(stepParallax);
		return () => {
			window.removeEventListener('pointermove', trackPointer);
			cancelAnimationFrame(animationFrame);
		};
	});

	/**
	 * Near layers travel further than far ones — that difference reads as depth.
	 * The offset rides on the layer as a CSS variable rather than a transform: a
	 * transformed layer would be its own stacking context, trapping a hovered
	 * tile's z-index behind every tile of the layers in front of it.
	 */
	function layerOffsetX(parallaxPx: number): string {
		return `${(-pointerX * parallaxPx).toFixed(2)}px`;
	}

	function layerOffsetY(parallaxPx: number): string {
		const scrollDrift = scrollOffset * parallaxPx * SCROLL_DEPTH_SCALE;
		return `${(-pointerY * parallaxPx - scrollDrift).toFixed(2)}px`;
	}

	/** One photo per tile, never repeated — tiles past the end of the list stay blank. */
	function tileImage(layerIndex: number, tileIndex: number): string {
		const precedingLayers = layerTiles.slice(0, layerIndex);
		const precedingTiles = precedingLayers.reduce((total, tiles) => total + tiles.length, 0);
		const imageIndex = precedingTiles + tileIndex;
		if (imageIndex >= images.length) return '';
		return images[imageIndex];
	}
</script>

{#snippet tileFrame(imageSrc: string)}
	<div
		class="h-full w-full overflow-hidden rounded-[10px] border border-line bg-elevated shadow-[0_10px_30px_-12px_rgb(0_0_0/0.6)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.6] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
	>
		{#if imageSrc}
			<img
				src={imageSrc}
				alt=""
				loading="lazy"
				decoding="async"
				class="h-full w-full object-cover"
			/>
		{/if}
	</div>
{/snippet}

<!-- Depth order is DOM order; `isolate` keeps a hovered tile's z-index below the hero copy. -->
<div class="pointer-events-none absolute inset-0 isolate overflow-hidden" aria-hidden="true">
	<div class="absolute inset-0" style:--offset-x={layerOffsetX(7)} style:--offset-y={layerOffsetY(7)}>
		{#each layerTiles[0] as tile, tileIndex (tileIndex)}
			<div
				class="group pointer-events-auto absolute translate-x-[calc(-50%+var(--offset-x))] translate-y-[calc(-50%+var(--offset-y))] opacity-15 blur-[1.5px] saturate-[0.25] transition-[opacity,filter] duration-500 ease-out hover:z-50 hover:opacity-100 hover:blur-none hover:saturate-100 motion-reduce:transition-none"
				style:left="{tile.leftPercent}%"
				style:top="{tile.topPercent}%"
				style:width="{tile.widthPercent}%"
				style:aspect-ratio={tile.aspectRatio}
			>
				{@render tileFrame(tileImage(0, tileIndex))}
			</div>
		{/each}
	</div>

	<div
		class="absolute inset-0"
		style:--offset-x={layerOffsetX(16)}
		style:--offset-y={layerOffsetY(16)}
	>
		{#each layerTiles[1] as tile, tileIndex (tileIndex)}
			<div
				class="group pointer-events-auto absolute translate-x-[calc(-50%+var(--offset-x))] translate-y-[calc(-50%+var(--offset-y))] opacity-45 blur-[0.7px] saturate-[0.45] transition-[opacity,filter] duration-500 ease-out hover:z-50 hover:opacity-100 hover:blur-none hover:saturate-100 motion-reduce:transition-none"
				style:left="{tile.leftPercent}%"
				style:top="{tile.topPercent}%"
				style:width="{tile.widthPercent}%"
				style:aspect-ratio={tile.aspectRatio}
			>
				{@render tileFrame(tileImage(1, tileIndex))}
			</div>
		{/each}
	</div>

	<div
		class="absolute inset-0"
		style:--offset-x={layerOffsetX(28)}
		style:--offset-y={layerOffsetY(28)}
	>
		{#each layerTiles[2] as tile, tileIndex (tileIndex)}
			<div
				class="group pointer-events-auto absolute translate-x-[calc(-50%+var(--offset-x))] translate-y-[calc(-50%+var(--offset-y))] opacity-70 saturate-[0.7] transition-[opacity,filter] duration-500 ease-out hover:z-50 hover:opacity-100 hover:saturate-100 motion-reduce:transition-none"
				style:left="{tile.leftPercent}%"
				style:top="{tile.topPercent}%"
				style:width="{tile.widthPercent}%"
				style:aspect-ratio={tile.aspectRatio}
			>
				{@render tileFrame(tileImage(2, tileIndex))}
			</div>
		{/each}
	</div>

	<div
		class="absolute inset-0"
		style:--offset-x={layerOffsetX(44)}
		style:--offset-y={layerOffsetY(44)}
	>
		{#each layerTiles[3] as tile, tileIndex (tileIndex)}
			<div
				class="group pointer-events-auto absolute translate-x-[calc(-50%+var(--offset-x))] translate-y-[calc(-50%+var(--offset-y))] opacity-90 saturate-[0.95] transition-[opacity,filter] duration-500 ease-out hover:z-50 hover:opacity-100 hover:saturate-100 motion-reduce:transition-none"
				style:left="{tile.leftPercent}%"
				style:top="{tile.topPercent}%"
				style:width="{tile.widthPercent}%"
				style:aspect-ratio={tile.aspectRatio}
			>
				{@render tileFrame(tileImage(3, tileIndex))}
			</div>
		{/each}
	</div>
</div>

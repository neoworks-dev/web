<script lang="ts">
	import type { Snippet } from 'svelte';
	import { mountainRidges } from './mountainRidges';
	import SkyProps from './SkyProps.svelte';

	let {
		parallax = true,
		behindFrontRidge
	}: {
		/** Farther ridges lag behind as the page scrolls; the front ridge stays put. Only useful near the top of the page. */
		parallax?: boolean;
		/** Drawn between the near and the front ridge, so the front ridge can hide its lower part. */
		behindFrontRidge?: Snippet;
	} = $props();

	const layers = [
		{ path: mountainRidges.far, fill: 'var(--ridge-far)', scrollShift: '160px' },
		{ path: mountainRidges.midFar, fill: 'var(--ridge-mid-far)', scrollShift: '120px' },
		{ path: mountainRidges.mid, fill: 'var(--ridge-mid)', scrollShift: '80px' },
		{ path: mountainRidges.near, fill: 'var(--ridge-near)', scrollShift: '40px' },
		{ path: mountainRidges.front, fill: 'var(--ridge-front)', scrollShift: '0px' }
	];

	/** The ridge's top edge only, so the outline does not trace the box it is filled down to. */
	function ridgeLine(path: string): string {
		return path.replace('M0,480 L', 'M').replace(' L1440,480 Z', '');
	}

	function parallaxClass(): string {
		if (parallax) return 'scroll-sink';
		return '';
	}
</script>

{#snippet ridge(layer: (typeof layers)[number])}
	<svg
		viewBox="0 0 1440 480"
		preserveAspectRatio="xMidYMax slice"
		class={['absolute inset-x-0 bottom-0 aspect-[3/1] min-h-[58%] w-full', parallaxClass()]}
		style="--scroll-shift: {layer.scrollShift}"
	>
		<path d={layer.path} fill={layer.fill} />
		<path
			d={ridgeLine(layer.path)}
			fill="none"
			stroke="var(--ink)"
			stroke-width="2.5"
			stroke-linejoin="round"
			vector-effect="non-scaling-stroke"
		/>
	</svg>
{/snippet}

<div data-sky-stage aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
	<div class="absolute inset-0 bg-linear-to-b from-sky to-paper"></div>
	<div class="stars absolute inset-x-0 top-0 h-2/3"></div>
	<SkyProps sunClass={parallaxClass()} />

	{#each layers.slice(0, -1) as layer (layer.path)}
		{@render ridge(layer)}
	{/each}

	{#if behindFrontRidge}
		<div class={['absolute inset-0', parallaxClass()]} style="--scroll-shift: 20px">
			{@render behindFrontRidge()}
		</div>
	{/if}

	{@render ridge(layers[layers.length - 1])}
</div>

<style>
	/* Invisible by day: --star is transparent until the night scene sets it. */
	.stars {
		background-image:
			radial-gradient(1.5px 1.5px at 8% 22%, var(--star) 50%, transparent 51%),
			radial-gradient(1px 1px at 15% 48%, var(--star) 50%, transparent 51%),
			radial-gradient(2px 2px at 22% 12%, var(--star) 50%, transparent 51%),
			radial-gradient(1px 1px at 29% 35%, var(--star) 50%, transparent 51%),
			radial-gradient(1.5px 1.5px at 36% 8%, var(--star) 50%, transparent 51%),
			radial-gradient(1px 1px at 41% 58%, var(--star) 50%, transparent 51%),
			radial-gradient(1.5px 1.5px at 47% 26%, var(--star) 50%, transparent 51%),
			radial-gradient(1px 1px at 53% 14%, var(--star) 50%, transparent 51%),
			radial-gradient(2px 2px at 58% 44%, var(--star) 50%, transparent 51%),
			radial-gradient(1px 1px at 72% 18%, var(--star) 50%, transparent 51%),
			radial-gradient(1.5px 1.5px at 79% 52%, var(--star) 50%, transparent 51%),
			radial-gradient(1px 1px at 84% 9%, var(--star) 50%, transparent 51%),
			radial-gradient(2px 2px at 90% 33%, var(--star) 50%, transparent 51%),
			radial-gradient(1px 1px at 95% 61%, var(--star) 50%, transparent 51%),
			radial-gradient(1px 1px at 4% 64%, var(--star) 50%, transparent 51%),
			radial-gradient(1.5px 1.5px at 66% 6%, var(--star) 50%, transparent 51%);
	}
</style>

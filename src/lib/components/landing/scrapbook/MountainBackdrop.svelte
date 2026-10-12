<script lang="ts">
	import type { Snippet } from 'svelte';
	import { mountainRidges } from './mountainRidges';

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
		if (parallax) return 'ridge';
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

<div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
	<div class="absolute inset-0 bg-linear-to-b from-sky to-paper"></div>
	<div
		class={[
			'absolute left-[64%] top-[40%] size-[150px] rounded-full border-[2.5px] border-ink bg-sun shadow-[0_0_120px_60px_var(--sun)]',
			parallaxClass()
		]}
		style="--scroll-shift: 200px"
	></div>

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
	@media (prefers-reduced-motion: no-preference) {
		@supports (animation-timeline: scroll()) {
			.ridge {
				animation: ridge-sink linear both;
				animation-timeline: scroll(root);
				animation-range: 0 100vh;
			}
		}
	}

	@keyframes ridge-sink {
		to {
			transform: translateY(var(--scroll-shift));
		}
	}
</style>

<script lang="ts">
	import { hillEdge } from './hillEdge';
</script>

<!-- Sits on top of a meadow section, so the hills rise into whatever is above it. -->
<svg
	aria-hidden="true"
	viewBox="0 0 1440 120"
	preserveAspectRatio="none"
	class="pointer-events-none absolute inset-x-0 bottom-[calc(100%-3px)] h-[110px] w-full"
>
	<path d={hillEdge.fill} fill="var(--meadow)" />
	<path
		d={hillEdge.edge}
		fill="none"
		stroke="var(--ink)"
		stroke-width="2.5"
		stroke-linejoin="round"
		vector-effect="non-scaling-stroke"
	/>
	{#each hillEdge.pines as pine (pine)}
		<path
			d={pine}
			fill="var(--ridge-mid)"
			stroke="var(--ink)"
			stroke-width="2"
			stroke-linejoin="round"
			vector-effect="non-scaling-stroke"
		/>
	{/each}
</svg>

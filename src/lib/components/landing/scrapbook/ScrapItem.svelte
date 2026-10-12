<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';
	import { draggable } from '$lib/actions/draggable';

	type Tape = 'top' | 'corners' | 'none';

	let {
		left,
		top,
		rotate,
		delay = 0,
		tape = 'top',
		class: className = '',
		children
	}: {
		/** Position on desktop, as a percentage of the scrapbook area. */
		left: string;
		top: string;
		rotate: number;
		delay?: number;
		tape?: Tape;
		class?: ClassValue;
		children: Snippet;
	} = $props();
</script>

<div
	use:draggable
	style="--left: {left}; --top: {top}; rotate: {rotate}deg; animation-delay: {delay}ms;"
	class={[
		'relative z-10 cursor-grab animate-drop-in select-none motion-reduce:animate-none md:absolute md:top-[var(--top)] md:left-[var(--left)]',
		className
	]}
>
	{#if tape === 'top'}
		<span
			class="absolute -top-3 left-1/2 z-10 h-6 w-20 -translate-x-1/2 -rotate-3 bg-tape shadow-sm"
		></span>
	{:else if tape === 'corners'}
		<span class="absolute -top-2 -left-4 z-10 h-5 w-14 -rotate-[38deg] bg-tape shadow-sm"></span>
		<span class="absolute -top-2 -right-4 z-10 h-5 w-14 rotate-[38deg] bg-tape shadow-sm"></span>
	{/if}
	{@render children()}
</div>

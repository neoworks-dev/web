<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';
	import { reveal } from '$lib/actions/reveal';

	let {
		rotate = 0,
		revealDelay = 0,
		tape = true,
		class: className = '',
		children
	}: {
		rotate?: number;
		revealDelay?: number;
		tape?: boolean;
		class?: ClassValue;
		children: Snippet;
	} = $props();
</script>

<!-- Always light paper, even inside a dark section. -->
<div
	data-theme="light"
	use:reveal={{ delay: revealDelay }}
	style="rotate: {rotate}deg"
	class={['relative rounded-[3px] bg-surface p-6 shadow-[0_8px_24px_rgba(0,0,0,0.10)]', className]}
>
	{#if tape}
		<span
			aria-hidden="true"
			class="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 -rotate-2 bg-tape shadow-sm"
		></span>
	{/if}
	{@render children()}
</div>

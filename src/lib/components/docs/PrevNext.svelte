<script lang="ts">
	import ArrowLeftIcon from 'phosphor-svelte/lib/ArrowLeftIcon';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import type { DocLink } from '$lib/data/docsNav';

	let { previous, next }: { previous?: DocLink; next?: DocLink } = $props();
</script>

<nav aria-label="Previous and next page" class="mt-12 grid grid-cols-2 gap-4 max-sm:grid-cols-1">
	{#if previous}
		<a
			href={previous.href}
			class="group flex flex-col gap-1 rounded-md border-2 border-ink bg-surface px-5 py-4 transition-colors hover:bg-hover"
		>
			<span class="flex items-center gap-1.5 font-hand text-lg leading-none text-brand">
				<ArrowLeftIcon size={14} weight="bold" class="transition-transform group-hover:-translate-x-0.5" />
				Previous
			</span>
			<span class="font-medium text-default">{previous.label}</span>
		</a>
	{:else}
		<span></span>
	{/if}
	{#if next}
		<a
			href={next.href}
			class="group flex flex-col items-end gap-1 rounded-md border-2 border-ink bg-surface px-5 py-4 text-right transition-colors hover:bg-hover"
		>
			<span class="flex items-center gap-1.5 font-hand text-lg leading-none text-brand">
				Next
				<ArrowRightIcon size={14} weight="bold" class="transition-transform group-hover:translate-x-0.5" />
			</span>
			<span class="font-medium text-default">{next.label}</span>
		</a>
	{/if}
</nav>

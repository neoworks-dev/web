<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		subtitle,
		actions,
	}: {
		title: string;
		subtitle?: string;
		actions?: Snippet;
	} = $props();
</script>

<!-- Slim header card: a paper slip without a titlebar. -->
<div class="w-full rounded-[3px] bg-surface border border-line-faint shadow-[0_8px_24px_rgba(0,0,0,0.10)] px-4 py-3.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
	<div class="min-w-0">
		<h1 class="font-hand text-2xl text-brand leading-none">{title}</h1>
		{#if subtitle}
			<p class="text-[12px] text-dim truncate">{subtitle}</p>
		{/if}
	</div>
	{#if actions}
		<div class="shrink-0">
			{@render actions()}
		</div>
	{/if}
</div>

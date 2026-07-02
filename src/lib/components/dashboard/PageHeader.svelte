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

<!-- Slim header card: sits on the pegboard like a widget but without a titlebar. -->
<div class="w-full rounded-xl bg-elevated border border-line-faint px-4 py-3.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
	<div class="min-w-0">
		<h1 class="text-[15px] font-semibold text-default leading-tight">{title}</h1>
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

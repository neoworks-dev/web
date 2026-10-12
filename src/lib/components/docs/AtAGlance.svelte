<script lang="ts">
	import PaperCard from '$lib/components/landing/scrapbook/PaperCard.svelte';
	export type GlanceItem = { label: string; value: string; href?: string };

	let { items }: { items: readonly GlanceItem[] } = $props();
</script>

<PaperCard rotate={-0.6} class="not-prose my-8 px-5 py-4">
	<p class="m-0 font-hand text-xl leading-none text-brand">At a glance</p>
	<dl class="mb-0 mt-3 flex flex-col gap-2.5">
		{#each items as item (item.label)}
			<div class="flex items-baseline justify-between gap-4 border-b border-line-faint pb-2 last:border-b-0 last:pb-0">
				<dt class="text-sm text-dim">{item.label}</dt>
				<dd class="m-0 text-right text-sm font-medium text-default">
					{#if item.href}
						<a href={item.href} class="underline underline-offset-2 hover:text-brand">{item.value}</a>
					{:else}
						{item.value}
					{/if}
				</dd>
			</div>
		{/each}
	</dl>
</PaperCard>

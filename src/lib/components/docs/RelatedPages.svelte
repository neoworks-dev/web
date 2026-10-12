<script lang="ts">
	import PaperCard from '$lib/components/landing/scrapbook/PaperCard.svelte';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';

	export type RelatedPage = { label: string; href: string; description?: string };

	let { pages }: { pages: readonly RelatedPage[] } = $props();
</script>

<PaperCard rotate={0.5} class="not-prose my-8 px-5 py-4">
	<p class="m-0 font-hand text-xl leading-none text-brand">See also</p>
	<ul class="m-0 mt-3 flex list-none flex-col gap-3 p-0">
		{#each pages as page (page.href)}
			<li class="m-0 p-0">
				<a href={page.href} class="group flex items-start justify-between gap-3">
					<span>
						<span class="block text-sm font-medium text-default">{page.label}</span>
						{#if page.description}
							<span class="block text-[13px] leading-snug text-dim">{page.description}</span>
						{/if}
					</span>
					<ArrowRightIcon
						size={14}
						weight="bold"
						class="mt-1 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand"
					/>
				</a>
			</li>
		{/each}
	</ul>
</PaperCard>

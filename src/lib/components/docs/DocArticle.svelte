<script lang="ts">
	import type { ComponentProps, Snippet } from 'svelte';
	import { enhanceCode } from '$lib/actions/enhanceCode';
	import AtAGlance, { type GlanceItem } from './AtAGlance.svelte';
	import RelatedPages, { type RelatedPage } from './RelatedPages.svelte';
	import Marmot from '$lib/components/landing/scrapbook/Marmot.svelte';
	import PaperCard from '$lib/components/landing/scrapbook/PaperCard.svelte';

	// mdsvex passes a page's frontmatter as props and its compiled markdown as `children`.
	let {
		title = '',
		description = '',
		marmot,
		glance = [],
		related = [],
		children
	}: {
		title?: string;
		description?: string;
		/** A marmot pose shown beside the title. */
		marmot?: ComponentProps<typeof Marmot>['pose'];
		/** Facts shown in a card in the right margin, as label and value pairs. */
		glance?: GlanceItem[];
		/** Pages to read next, shown in the right margin below the article. */
		related?: RelatedPage[];
		children?: Snippet;
	} = $props();
</script>

<svelte:head>
	{#if title}<title>{title} — NeoWorks Docs</title>{/if}
	{#if description}<meta name="description" content={description} />{/if}
</svelte:head>

<!-- A taped sheet of paper, like the cards on the landing page. -->
<PaperCard class="px-12 py-10 max-md:px-6 max-md:py-8">
	<!-- The side cards hang in the right margin on wide screens and sit in the text column below that. -->
	{#if glance.length > 0}
		<div class="xl:absolute xl:left-[calc(100%+28px)] xl:top-0 xl:w-[400px]">
			<AtAGlance items={glance} />
		</div>
	{/if}
	<article use:enhanceCode class="doc-article prose max-w-none">
		{#if title}
			<header class="doc-article__header flex items-end justify-between gap-6">
				<div>
					<h1>{title}</h1>
					{#if description}
						<p class="doc-article__desc">{description}</p>
					{/if}
				</div>
				{#if marmot}
					<Marmot pose={marmot} class="not-prose w-[140px] shrink-0 max-md:hidden" />
				{/if}
			</header>
		{/if}
		{@render children?.()}
	</article>

	{#if related.length > 0}
		<div class="xl:absolute xl:bottom-0 xl:left-[calc(100%+28px)] xl:w-[400px]">
			<RelatedPages pages={related} />
		</div>
	{/if}
</PaperCard>

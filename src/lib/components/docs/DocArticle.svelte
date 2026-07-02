<script lang="ts">
	// mdsvex passes a page's frontmatter as props and its compiled markdown as `children`.
	let {
		title = '',
		description = '',
		children
	}: {
		title?: string;
		description?: string;
		children?: import('svelte').Snippet;
	} = $props();
</script>

<svelte:head>
	{#if title}<title>{title} — NeoWorks Docs</title>{/if}
	{#if description}<meta name="description" content={description} />{/if}
</svelte:head>

<article class="doc-article prose max-w-none">
	{#if title}
		<header class="doc-article__header">
			<h1>{title}</h1>
			{#if description}
				<p class="doc-article__desc">{description}</p>
			{/if}
		</header>
	{/if}
	{@render children?.()}
</article>

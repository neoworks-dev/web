<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import { productForPath } from '$lib/data/docsNav';
	import TableOfContents from '$lib/components/docs/TableOfContents.svelte';
	import DocSearch from '$lib/components/docs/DocSearch.svelte';

	let { children } = $props();

	// Sidebar tracks the active product so each product shows its own nav tree.
	const activeProduct = $derived(productForPath($page.url.pathname));

	type Heading = { id: string; text: string; level: number };

	let contentEl = $state<HTMLElement | undefined>();
	let headings = $state<Heading[]>([]);
	let activeIds = $state<Set<string>>(new Set());
	let observer: IntersectionObserver | undefined;

	function buildToc() {
		if (!contentEl) return;
		const nodes = contentEl.querySelectorAll<HTMLElement>('h2, h3');
		headings = Array.from(nodes)
			.filter((node) => node.id)
			.map((node) => ({
				id: node.id,
				text: node.textContent ?? '',
				level: Number(node.tagName[1])
			}));
		setupObserver(nodes);
	}

	function setupObserver(nodes: NodeListOf<HTMLElement>) {
		observer?.disconnect();
		observer = new IntersectionObserver(
			(entries) => {
				const next = new Set(activeIds);
				for (const entry of entries) {
					if (entry.isIntersecting) next.add(entry.target.id);
					else next.delete(entry.target.id);
				}
				activeIds = next;
			},
			{ rootMargin: '-100px 0px -45% 0px' }
		);
		nodes.forEach((node) => observer?.observe(node));
	}

	onMount(buildToc);
	afterNavigate(async () => {
		await tick();
		buildToc();
	});
	onDestroy(() => observer?.disconnect());

	const isActive = (href: string) => $page.url.pathname === href;
</script>

<div class="mx-auto w-full max-w-[1320px] px-6 pb-24 pt-36">
	<div class="grid grid-cols-1 gap-10 lg:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[200px_minmax(0,1fr)_180px]">
		<!-- Left: section nav (active product) -->
		<aside class="hidden lg:block">
			<nav class="sticky top-32 flex flex-col gap-6">
				<DocSearch />
				{#each activeProduct.sections as section}
					<div class="flex flex-col gap-1">
						<h2 class="mb-1 px-2 text-2xs font-medium uppercase tracking-[0.12em] text-faint [font-family:var(--font-mono)]">
							{section.title}
						</h2>
						{#each section.links as link}
							<a
								href={link.href}
								class="rounded-lg px-2 py-1.5 text-sm transition-colors {isActive(link.href)
									? 'bg-hover font-medium text-default'
									: 'text-muted hover:bg-hover hover:text-default'}"
							>
								{link.label}
							</a>
						{/each}
					</div>
				{/each}
			</nav>
		</aside>

		<!-- Center: rendered doc -->
		<div bind:this={contentEl} class="min-w-0 max-w-[760px]">
			{@render children()}
		</div>

		<!-- Right: on-page TOC -->
		<aside class="hidden xl:block">
			<TableOfContents {headings} {activeIds} />
		</aside>
	</div>
</div>

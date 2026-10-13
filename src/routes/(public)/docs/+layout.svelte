<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import { editUrlForPath, neighboursOfPath, productForPath } from '$lib/data/docsNav';
	import PencilSimpleIcon from 'phosphor-svelte/lib/PencilSimpleIcon';
	import PageFeedback from '$lib/components/docs/PageFeedback.svelte';
	import PrevNext from '$lib/components/docs/PrevNext.svelte';
	import DocSearch from '$lib/components/docs/DocSearch.svelte';
	import DocsProductSwitcher from '$lib/components/docs/DocsProductSwitcher.svelte';

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

	// /docs itself is the overview of every product, without a sidebar or contents.
	const isDocsHome = $derived($page.url.pathname === '/docs');

	const isActive = (href: string) => $page.url.pathname === href;

	/** The first heading in view: the section being read, marked in the sidebar. */
	const currentHeadingId = $derived.by(() => {
		const visibleHeading = headings.find((heading) => activeIds.has(heading.id));
		if (visibleHeading === undefined) return undefined;
		return visibleHeading.id;
	});

	const neighbours = $derived(neighboursOfPath($page.url.pathname));
	const pageTitle = $derived.by(() => {
		const links = activeProduct.sections.flatMap((section) => section.links);
		const link = links.find((candidate) => isActive(candidate.href));
		if (link === undefined) return '';
		return link.label;
	});

	function showsHeadings(href: string): boolean {
		return isActive(href) && headings.length > 0;
	}

	function ariaCurrent(href: string): 'page' | undefined {
		if (isActive(href)) return 'page';
		return undefined;
	}
</script>

<!-- Paper by day, charcoal at night: the same scrapbook as the landing page. -->
<div class="bg-paper">
	<div class="mx-auto w-full max-w-[1480px] px-6 pb-24 pt-28">
		{#if isDocsHome}
			{@render children()}
		{:else}
			<div class="grid grid-cols-1 gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
				<!-- Left: section nav (active product) -->
				<aside class="hidden lg:block">
					<!-- Raised above the article, so the product picker's list opens over it. -->
					<nav class="sticky top-28 z-raised flex flex-col gap-6">
						<div class="flex flex-col gap-2">
							<DocsProductSwitcher {activeProduct} />
							<DocSearch />
						</div>
						{#each activeProduct.sections as section}
							<div class="flex flex-col gap-1">
								<h2 class="mb-1 px-2 font-hand text-xl leading-none text-brand">
									{section.title}
								</h2>
								{#each section.links as link (link.href)}
									<!-- The current page is marked with a highlighter stroke. -->
									<a
										href={link.href}
										aria-current={ariaCurrent(link.href)}
										class={[
											'rounded-[2px] px-2 py-1.5 text-sm transition-colors',
											{
												'-rotate-[0.6deg] bg-note font-medium text-ink': isActive(link.href),
												'text-muted hover:text-default': !isActive(link.href)
											}
										]}
									>
										{link.label}
									</a>
									{#if showsHeadings(link.href)}
										<!-- The open page's sections, with the one being read marked. -->
										<ul class="mb-2 ml-3 mt-1 flex flex-col border-l border-line-faint">
											{#each headings as heading (heading.id)}
												<li>
													<a
														href="#{heading.id}"
														class={[
															'-ml-px block border-l-2 py-1 text-[13px] leading-snug transition-colors',
															{
																'pl-3': heading.level === 2,
																'pl-6': heading.level === 3,
																'border-brand text-default': heading.id === currentHeadingId,
																'border-transparent text-dim hover:text-default':
																	heading.id !== currentHeadingId
															}
														]}
													>
														{heading.text}
													</a>
												</li>
											{/each}
										</ul>
									{/if}
								{/each}
							</div>
						{/each}
					</nav>
				</aside>

				<!-- Center: rendered doc -->
				<div bind:this={contentEl} class="min-w-0 max-w-[760px] xl:max-w-[700px]">
					{@render children()}

					<PrevNext previous={neighbours.previous} next={neighbours.next} />

					<footer
						class="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line-faint pt-6"
					>
						<PageFeedback pathname={$page.url.pathname} {pageTitle} />
						<a
							href={editUrlForPath($page.url.pathname)}
							target="_blank"
							rel="noreferrer"
							class="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-default"
						>
							<PencilSimpleIcon size={14} />
							Edit this page on GitHub
						</a>
					</footer>
				</div>
			</div>
		{/if}
	</div>
</div>

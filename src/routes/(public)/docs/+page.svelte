<script lang="ts">
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import { docProducts } from '$lib/data/docsNav';
	import SectionHeading from '$lib/components/landing/SectionHeading.svelte';
	import Marmot from '$lib/components/landing/scrapbook/Marmot.svelte';
	import PaperCard from '$lib/components/landing/scrapbook/PaperCard.svelte';

	const cardRotations = [-0.8, 0.6, -0.5];
</script>

<svelte:head>
	<title>Docs — NeoWorks</title>
	<meta
		name="description"
		content="Guides and references for the NeoWorks platform and the apps built on it."
	/>
</svelte:head>

<div class="flex items-end justify-between gap-8">
	<SectionHeading
		eyebrow="Docs"
		title="How everything works."
		subtitle="Guides and references for the NeoWorks platform and the apps built on it. Pick where to start."
	/>
	<Marmot pose="reader" class="w-[170px] shrink-0 max-md:hidden" />
</div>

<div class="mt-12 grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-md:grid-cols-1">
	{#each docProducts as product, index (product.id)}
		{@const Icon = product.icon}
		<a href={product.href} class="group block">
			<PaperCard rotate={cardRotations[index]} revealDelay={index * 100} class="flex h-full flex-col p-7">
				<span
					class="flex size-11 items-center justify-center rounded-full border-2 border-ink bg-note text-ink"
				>
					<Icon size={22} weight="bold" />
				</span>
				<span class="mt-5 font-hand text-lg leading-none text-brand">{product.audience}</span>
				<h2 class="mt-1.5 text-xl font-semibold tracking-tight text-default">{product.label}</h2>
				<p class="mt-1 text-sm text-muted">{product.tagline}</p>

				<div class="mt-5 flex flex-1 flex-col gap-3">
					{#each product.sections as section (section.title)}
						<div>
							<span class="font-hand text-lg leading-none text-brand">{section.title}</span>
							<p class="mt-1 text-sm text-dim">
								{section.links.map((link) => link.label).join(' · ')}
							</p>
						</div>
					{/each}
				</div>

				<span class="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-default">
					Read the {product.label} docs
					<ArrowRightIcon size={14} weight="bold" class="transition-transform group-hover:translate-x-0.5" />
				</span>
			</PaperCard>
		</a>
	{/each}
</div>

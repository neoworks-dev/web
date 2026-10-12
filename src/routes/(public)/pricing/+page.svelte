<script lang="ts">
	import SectionHeading from '$lib/components/landing/SectionHeading.svelte';
	import PricingTiers from '$lib/components/landing/PricingTiers.svelte';
	import PricingEstimator from '$lib/components/landing/PricingEstimator.svelte';
	import BusinessPricing from '$lib/components/landing/BusinessPricing.svelte';
	import Faq from '$lib/components/landing/Faq.svelte';
	import FinalCta from '$lib/components/landing/FinalCta.svelte';
	import MountainBackdrop from '$lib/components/landing/scrapbook/MountainBackdrop.svelte';
	import LandscapeEdge from '$lib/components/landing/scrapbook/LandscapeEdge.svelte';
	import PaperCard from '$lib/components/landing/scrapbook/PaperCard.svelte';
	import Marmot from '$lib/components/landing/scrapbook/Marmot.svelte';
	import GiftIcon from 'phosphor-svelte/lib/GiftIcon';
	import BackpackIcon from 'phosphor-svelte/lib/BackpackIcon';
	import ReceiptIcon from 'phosphor-svelte/lib/ReceiptIcon';

	const parts = [
		{
			title: 'Start free',
			body: 'Your account and 1 GB of encrypted storage across every app, free forever and with no card required.',
			Icon: GiftIcon,
			rotate: -1
		},
		{
			title: 'Pay as you go',
			body: '€2.99 per user a month with 5 GB included. Beyond that you pay exactly what the storage costs us, €0.008 per GB.',
			Icon: ReceiptIcon,
			rotate: 0.8
		},
		{
			title: 'Or pick a plan',
			body: '200 GB, 500 GB or 1.5 TB for one fixed price a month or a year. It costs a little more, but the bill never changes.',
			Icon: BackpackIcon,
			rotate: -0.6
		}
	];

	const pricingQuestions = [
		{
			q: 'Is there really a free tier?',
			a: 'Yes. Your account and 1 GB of encrypted storage are free forever, with no credit card. It is enough to use the apps day to day.'
		},
		{
			q: 'Should I pick a plan or pay as you go?',
			a: 'Pay as you go. It is cheaper for almost everyone, even if you fill a plan to the last gigabyte. A plan is for when you would rather have the same bill every month, whatever you store.'
		},
		{
			q: 'What happens when my plan is full?',
			a: 'Nothing gets deleted. Move up to the next plan, or switch to pay as you go, which is cheaper anyway.'
		},
		{
			q: 'What does “billed at cost” mean?',
			a: 'On pay as you go, storage beyond the included 5 GB costs what our infrastructure provider charges us, with no margin added. We make our money on the €2.99 seat, not on your storage.'
		},
		{
			q: 'What counts toward storage?',
			a: 'Encrypted media — files, photos, video, documents. Structured records like contacts, calendar and tasks are tiny and included; you won’t meaningfully pay for them.'
		},
		{
			q: 'Can I avoid fees entirely?',
			a: 'Self-host. You can run the whole stack on your own hardware, with unlimited storage and zero NeoWorks fees.'
		}
	];
</script>

<svelte:head>
	<title>Pricing — NeoWorks</title>
	<meta
		name="description"
		content="Start free with 1 GB, then pay as you go from €2.99 a month with storage billed at cost, or pick a plan with one fixed price. No ads, no data sales, or self-host for free."
	/>
</svelte:head>

<main class="bg-meadow">
	<!-- The summit: heading in the sky, the archivist counting files behind the front ridge. -->
	<section class="relative min-h-[max(620px,calc(100vw/3+300px))] overflow-hidden px-6 pt-32 max-md:min-h-[520px] max-md:px-5 max-md:pt-28">
		<MountainBackdrop>
			{#snippet behindFrontRidge()}
				<img
					src="/marmot/archivist.webp"
					alt=""
					draggable="false"
					class="absolute -bottom-[2%] left-[2%] w-[150px] max-lg:hidden"
				/>
			{/snippet}
		</MountainBackdrop>

		<div class="relative">
			<SectionHeading
				align="center"
				eyebrow="Pricing"
				title="Fair pricing, no surprises."
				subtitle="Start free, then pay as you go with storage billed at cost, or pick a plan with one fixed price. No ads and no data sales, whichever you choose."
			/>
		</div>
	</section>

	<!-- The forest, carrying on from the front ridge. -->
	<section
		data-theme="dark"
		class="relative -mt-1 bg-ridge-front px-6 pb-36 pt-[calc(2rem+0.25rem)] max-md:px-5 max-md:pb-28"
	>
		<!-- Pulled up over the ridges so the plans show on the first screen. -->
		<div class="relative mx-auto -mt-[calc(100vw/3-80px)] max-w-[1120px] max-md:mt-0">
			<PricingTiers />
		</div>
	</section>

	<!-- The golden field. -->
	<section class="relative bg-field px-6 py-24 max-md:px-5 max-md:py-16">
		<LandscapeEdge variant="field" fill="var(--field)" />
		<div class="mx-auto max-w-[1120px]">
			<div class="flex items-end justify-between gap-8">
				<SectionHeading eyebrow="How billing works" title="Three ways to pay." />
				<Marmot pose="filing" class="-mb-6 w-[190px] shrink-0 max-md:hidden" />
			</div>

			<div class="mt-12 grid grid-cols-3 gap-6 max-md:grid-cols-1">
				{#each parts as { title, body, Icon, rotate }, index (title)}
					<PaperCard {rotate} revealDelay={index * 100}>
						<span
							class="flex size-11 items-center justify-center rounded-full border-2 border-ink bg-note text-ink"
						>
							<Icon size={22} weight="bold" />
						</span>
						<h3 class="mt-5 text-base font-semibold tracking-tight text-default">{title}</h3>
						<p class="mt-2 text-sm leading-relaxed text-muted">{body}</p>
					</PaperCard>
				{/each}
			</div>

			<p class="mt-8 text-center text-xs text-muted">
				Storage is measured on encrypted media. See
				<a
					href="/docs/neoworks/encryption"
					class="text-default underline decoration-brand decoration-wavy underline-offset-4"
					>how storage works</a
				>.
			</p>
		</div>
	</section>

	<!-- The lake. -->
	<section class="relative bg-lake px-6 pb-28 pt-24 max-md:px-5 max-md:py-16">
		<LandscapeEdge variant="shore" fill="var(--lake)" />
		<div class="relative mx-auto max-w-[1120px]">
			<Marmot pose="chest" class="absolute -top-6 right-0 w-[150px] max-lg:hidden" />
			<SectionHeading
				align="center"
				eyebrow="Estimate"
				title="What would pay as you go cost?"
				subtitle="Drag the sliders to size it to your team and storage. A terabyte is right there in the presets."
			/>
			<div class="mt-12">
				<PricingEstimator />
			</div>
		</div>
	</section>

	<BusinessPricing />

	<Faq questions={pricingQuestions} title="Pricing questions." />

	<FinalCta />
</main>

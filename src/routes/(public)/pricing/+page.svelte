<script lang="ts">
	import SectionHeading from '$lib/components/landing/SectionHeading.svelte';
	import PricingTiers from '$lib/components/landing/PricingTiers.svelte';
	import PricingEstimator from '$lib/components/landing/PricingEstimator.svelte';
	import FinalCta from '$lib/components/landing/FinalCta.svelte';
	import GiftIcon from 'phosphor-svelte/lib/GiftIcon';
	import UserIcon from 'phosphor-svelte/lib/UserIcon';
	import ReceiptIcon from 'phosphor-svelte/lib/ReceiptIcon';
	import PlusIcon from 'phosphor-svelte/lib/PlusIcon';
	import MinusIcon from 'phosphor-svelte/lib/MinusIcon';

	const parts = [
		{
			title: 'A free 1 GB tier',
			body: 'Start with your identity and 1 GB of encrypted storage across every app — free forever, no card required.',
			Icon: GiftIcon
		},
		{
			title: '€2 per user / month',
			body: 'Pro unlocks 5 GB of included storage and priority support. Teams pay per seat; cancel anytime.',
			Icon: UserIcon
		},
		{
			title: 'Usage, billed at cost',
			body: 'Beyond what’s included you pay exactly what storage and compute cost us — pass-through, with zero markup.',
			Icon: ReceiptIcon
		}
	];

	const faqs = [
		{
			q: 'Is there really a free tier?',
			a: 'Yes — your identity plus 1 GB of encrypted storage, free forever and with no credit card. It’s enough to use the apps day to day.'
		},
		{
			q: 'What does “billed at cost” mean?',
			a: 'Beyond your included storage you pay the same price our infrastructure provider charges us — no margin added. We make our money on the flat €2 seat, not on your storage.'
		},
		{
			q: 'What counts toward storage?',
			a: 'Encrypted media — files, photos, video, documents. Structured records like contacts, calendar and tasks are tiny and included; you won’t meaningfully pay for them.'
		},
		{
			q: 'Is Pro priced per user?',
			a: 'Yes. Pro is €2 per user each month, so a team pays per active seat. Usage beyond the included 5 GB per user is billed at cost.'
		},
		{
			q: 'Can I avoid fees entirely?',
			a: 'Self-host. The whole stack is open source under MIT — run it on your own hardware with unlimited storage and zero NeoWorks fees.'
		}
	];

	let openIndex = $state<number | null>(0);
	function toggle(index: number) {
		openIndex = openIndex === index ? null : index;
	}
</script>

<svelte:head>
	<title>Pricing — NeoWorks</title>
	<meta
		name="description"
		content="A free 1 GB tier, €2 per user a month for Pro, and usage billed at cost — no markup, no ads, no data sales. Or self-host for free."
	/>
</svelte:head>

<!-- Hero + tiers -->
<section class="border-b border-line-faint px-6 pb-20 pt-32 max-md:px-5 max-md:pt-28">
	<div class="mx-auto max-w-[1120px]">
		<SectionHeading
			align="center"
			eyebrow="Pricing"
			title="Fair pricing, billed at cost."
			subtitle="A free tier to start, €2 per user a month for more, and only ever the real cost of the storage and compute you use — no markup, no ads, no data sales."
		/>

		<div class="mt-12">
			<PricingTiers />
		</div>
	</div>
</section>

<!-- How billing works -->
<section class="border-b border-line-faint px-6 py-24 max-md:px-5 max-md:py-16">
	<div class="mx-auto max-w-[1120px]">
		<SectionHeading eyebrow="How billing works" title="Three simple parts." />

		<div class="mt-12 grid grid-cols-3 gap-4 max-md:grid-cols-1">
			{#each parts as { title, body, Icon }}
				<div class="rounded-2xl border border-line-faint bg-elevated/50 p-6">
					<span
						class="flex size-11 items-center justify-center rounded-xl border border-line-faint bg-raised text-muted"
					>
						<Icon size={22} weight="duotone" />
					</span>
					<h3 class="mt-5 text-base font-semibold tracking-tight text-default">{title}</h3>
					<p class="mt-2 text-sm leading-relaxed text-muted">{body}</p>
				</div>
			{/each}
		</div>

		<p class="mt-6 text-center text-xs text-dim">
			Storage is measured on encrypted media. See
			<a href="/docs/neoworks/encryption" class="text-muted underline-offset-2 hover:text-default hover:underline"
				>how storage works →</a
			>
		</p>
	</div>
</section>

<!-- Estimator -->
<section class="border-b border-line-faint px-6 py-24 max-md:px-5 max-md:py-16">
	<div class="mx-auto max-w-[1120px]">
		<SectionHeading
			align="center"
			eyebrow="Estimate"
			title="What would it cost you?"
			subtitle="Drag the sliders to size it to your team and storage. A terabyte is right there in the presets."
		/>
		<div class="mt-12">
			<PricingEstimator />
		</div>
	</div>
</section>

<!-- FAQ -->
<section class="border-b border-line-faint px-6 py-24 max-md:px-5 max-md:py-16">
	<div class="mx-auto max-w-[760px]">
		<SectionHeading align="center" eyebrow="FAQ" title="Pricing questions." />

		<div class="mt-12 flex flex-col gap-2">
			{#each faqs as { q, a }, index}
				{@const isOpen = openIndex === index}
				<div class="overflow-hidden rounded-2xl border border-line-faint bg-elevated/50">
					<button
						type="button"
						aria-expanded={isOpen}
						onclick={() => toggle(index)}
						class="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-hover"
					>
						<span class="flex-1 text-[15px] font-medium text-default">{q}</span>
						<span class="flex size-6 shrink-0 items-center justify-center text-dim">
							{#if isOpen}
								<MinusIcon size={16} />
							{:else}
								<PlusIcon size={16} />
							{/if}
						</span>
					</button>
					{#if isOpen}
						<p class="px-5 pb-5 text-sm leading-relaxed text-muted">{a}</p>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</section>

<FinalCta />

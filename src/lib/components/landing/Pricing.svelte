<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import SectionHeading from './SectionHeading.svelte';
	import PricingTiers from './PricingTiers.svelte';
</script>

<section class="bg-field px-6 pb-32 pt-12 max-md:pb-24">
	<div class="mx-auto max-w-[1120px]">
		<SectionHeading
			eyebrow="Pricing"
			title="Fair pricing, no surprises."
			subtitle="Start free, then pay as you go with storage billed at cost, or pick a plan with one fixed price. No ads and no data sales, whichever you choose."
			align="center"
		/>

		<div use:reveal={{ delay: 100 }} class="mt-12">
			<PricingTiers />
		</div>

		<p class="mt-8 text-center text-sm text-muted">
			Need the detail? <a href="/pricing" class="text-default underline-offset-2 hover:underline"
				>See full pricing →</a
			>
		</p>
	</div>
</section>

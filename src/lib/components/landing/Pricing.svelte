<script lang="ts">
	import SectionHeading from './SectionHeading.svelte';
	import PricingTiers from './PricingTiers.svelte';
</script>

<section class="border-t border-line-faint px-6 py-24 max-md:py-16">
	<div class="mx-auto max-w-[1120px]">
		<SectionHeading
			eyebrow="Pricing"
			title="Pay for what you use. Nothing more."
			subtitle="No ads, no data sales, no margin baked into your storage. Beyond what’s included, you pay exactly what storage and compute cost us."
			align="center"
		/>

		<div class="mt-12">
			<PricingTiers />
		</div>

		<p class="mt-8 text-center text-sm text-muted">
			Need the detail? <a href="/pricing" class="text-default underline-offset-2 hover:underline"
				>See full pricing →</a
			>
		</p>
	</div>
</section>

<script lang="ts">
	import SectionHeading from './SectionHeading.svelte';
	import PaperCard from './scrapbook/PaperCard.svelte';
	import Marmot from './scrapbook/Marmot.svelte';

	const steps = [
		{
			n: '1',
			title: 'Create your account',
			body: 'Your encryption keys are made on your device when you sign up. They never reach our servers in a form we could use.',
			rotate: -1.5
		},
		{
			n: '2',
			title: 'Bring your things over',
			body: 'Connect the account they live in today, like Google, and your photos, calendar and contacts move across. Each item is encrypted before it leaves your device.',
			rotate: 1
		},
		{
			n: '3',
			title: 'Open them anywhere',
			body: 'Your phone and your laptop see the same things. Anywhere else, including our servers, they are unreadable.',
			rotate: -0.8
		}
	];
</script>

<!-- The forest: the hero's front ridge carries on into this section. -->
<!-- Overlaps the hero by a few pixels so no anti-aliased seam shows between them. -->
<section data-theme="dark" class="relative -mt-1 bg-ridge-front px-6 pb-40 pt-[calc(4rem+0.25rem)] max-md:pb-32">
	<div class="mx-auto max-w-[1120px]">
		<div class="flex items-end justify-between gap-8">
			<SectionHeading
				eyebrow="Moving over"
				title="Moving in takes an afternoon."
				subtitle="No exporting archives by hand, no sorting through folders afterwards. Your things arrive the way you left them."
			/>
			<Marmot pose="hiker" class="w-[170px] shrink-0 max-md:hidden" />
		</div>

		<div class="mt-12 grid grid-cols-3 gap-6 max-md:grid-cols-1">
			{#each steps as { n, title, body, rotate }, index (n)}
				<PaperCard {rotate} revealDelay={index * 100}>
					<span class="font-hand text-5xl leading-none text-brand">{n}.</span>
					<h3 class="mt-3 text-base font-semibold tracking-tight text-default">{title}</h3>
					<p class="mt-2 text-sm leading-relaxed text-muted">{body}</p>
				</PaperCard>
			{/each}
		</div>
	</div>
</section>

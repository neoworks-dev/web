<script lang="ts">
	import { resolve } from '$app/paths';
	import CheckIcon from 'phosphor-svelte/lib/CheckIcon';
	import SectionHeading from './SectionHeading.svelte';
	import LandscapeEdge from './scrapbook/LandscapeEdge.svelte';
	import Marmot from './scrapbook/Marmot.svelte';
	import PaperCard from './scrapbook/PaperCard.svelte';

	const features = [
		'5 GB encrypted storage included per user',
		'Beyond that €0.008 per GB, exactly what it costs us',
		'Every app on the Neoworks platform',
		'Security guaranteed in writing'
	];
</script>

<!-- Back on the golden field. -->
<section class="relative bg-field px-6 py-24 max-md:px-5 max-md:py-16">
	<LandscapeEdge variant="field" fill="var(--field)" />
	<div class="mx-auto max-w-[1120px]">
		<div class="flex items-end justify-between gap-8">
			<SectionHeading
				eyebrow="For business"
				title="Running a business?"
				subtitle="Pay as you go storage for the whole team, with every app on the platform and security guaranteed in writing."
			/>
			<Marmot pose="briefcase" class="w-[160px] shrink-0 max-md:hidden" />
		</div>

		<PaperCard rotate={-0.4} class="mt-12 grid grid-cols-[1fr_2fr] gap-8 p-8 max-md:grid-cols-1">
			<div class="flex flex-col">
				<span class="text-sm font-semibold tracking-tight text-default">Business</span>
				<div class="mt-4 flex flex-wrap items-baseline gap-x-1.5">
					<span class="text-4xl font-semibold tracking-tight text-default">€7.99</span>
					<span class="font-hand text-lg text-dim">per user / month</span>
				</div>
				<span class="mt-1 text-sm text-dim">or €79.90 per user a year</span>
				<a
					href={resolve('/auth/signup')}
					class="mt-6 rounded-md bg-brand px-4 py-2.5 text-center text-sm font-semibold text-brand-fg transition-colors hover:bg-brand-hover"
				>
					Get started
				</a>
			</div>

			<ul class="grid grid-cols-2 content-center gap-x-8 gap-y-3 max-md:grid-cols-1">
				{#each features as feature (feature)}
					<li class="flex items-start gap-2.5 text-sm text-muted">
						<CheckIcon size={16} weight="bold" class="mt-0.5 shrink-0 text-brand" />
						{feature}
					</li>
				{/each}
			</ul>
		</PaperCard>
	</div>
</section>

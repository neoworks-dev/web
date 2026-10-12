<script lang="ts">
	import SectionHeading from './SectionHeading.svelte';
	import PaperCard from './scrapbook/PaperCard.svelte';
	import Marmot from './scrapbook/Marmot.svelte';
	import LandscapeEdge from './scrapbook/LandscapeEdge.svelte';
	import ProhibitIcon from 'phosphor-svelte/lib/ProhibitIcon';
	import DownloadSimpleIcon from 'phosphor-svelte/lib/DownloadSimpleIcon';
	import GithubLogoIcon from 'phosphor-svelte/lib/GithubLogoIcon';

	const controls = [
		{
			title: 'Revoke any app, instantly',
			body: 'Every app holds a scoped grant you can see and cut off from one place. Pull access and it loses its keys to your data on the spot.',
			Icon: ProhibitIcon
		},
		{
			title: 'Export everything, anytime',
			body: 'Your data is yours to take. Download a full, decrypted copy whenever you like — no tickets, no waiting, no “contact support”.',
			Icon: DownloadSimpleIcon
		},
		{
			title: 'No lock-in, by design',
			body: 'Source available and self-hostable. If NeoWorks ever disappoints you — or just disappears — you can move your account to your own server.',
			Icon: GithubLogoIcon
		}
	];

	const cardRotations = [1, -1.2, 0.7];
</script>

<!-- The golden field, which carries on under the pricing. -->
<section class="relative bg-field px-6 py-24 max-md:py-16">
	<LandscapeEdge variant="field" fill="var(--field)" />
	<div class="mx-auto max-w-[1120px]">
		<div class="flex items-end justify-between gap-8">
			<SectionHeading
				eyebrow="Ownership & control"
				title="“Yours” isn’t a slogan. It’s a set of buttons."
				subtitle="Real ownership means you can leave, cut off access, and take your data with you — without asking permission."
			/>
			<Marmot pose="polaroid" class="w-[160px] shrink-0 max-md:hidden" />
		</div>

		<div class="mt-12 grid grid-cols-3 gap-6 max-md:grid-cols-1">
			{#each controls as { title, body, Icon }, index (title)}
				<PaperCard rotate={cardRotations[index]} revealDelay={index * 100}>
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
	</div>
</section>

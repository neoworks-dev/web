<script lang="ts">
	import SectionHeading from './SectionHeading.svelte';
	import PaperCard from './scrapbook/PaperCard.svelte';
	import Marmot from './scrapbook/Marmot.svelte';
	import HillEdge from './scrapbook/HillEdge.svelte';
	import FolderIcon from 'phosphor-svelte/lib/FolderIcon';
	import CalendarBlankIcon from 'phosphor-svelte/lib/CalendarBlankIcon';
	import AddressBookIcon from 'phosphor-svelte/lib/AddressBookIcon';
	import SlidersHorizontalIcon from 'phosphor-svelte/lib/SlidersHorizontalIcon';
	import CodeIcon from 'phosphor-svelte/lib/CodeIcon';
	import EnvelopeSimpleIcon from 'phosphor-svelte/lib/EnvelopeSimpleIcon';

	type AppEntry = { name: string; body: string; Icon: typeof FolderIcon };

	const storedApps: AppEntry[] = [
		{
			name: 'Drive',
			body: 'Documents, scans and everything that is not a photo, in folders you already know how to use.',
			Icon: FolderIcon
		},
		{
			name: 'Calendar',
			body: 'Your events and the people in them, on every device you own.',
			Icon: CalendarBlankIcon
		},
		{
			name: 'Contacts',
			body: 'Everyone you know, with the numbers, birthdays and addresses you have collected over the years.',
			Icon: AddressBookIcon
		}
	];

	const workingApps: AppEntry[] = [
		{
			name: 'Photo editor',
			body: 'Crop, adjust and retouch your photos where they are, without exporting them to another app first.',
			Icon: SlidersHorizontalIcon
		},
		{
			name: 'Code editor',
			body: 'Write code in the browser, with your projects kept in your own encrypted account.',
			Icon: CodeIcon
		},
		{
			name: 'Mail',
			body: 'A mail app for the address you already have. You keep your mail provider and use Neoworks as the app.',
			Icon: EnvelopeSimpleIcon
		}
	];

	const cardRotations = [-1.2, 0.8, -0.6];
</script>

{#snippet appCard({ name, body, Icon }: AppEntry, index: number)}
	<PaperCard rotate={cardRotations[index]} revealDelay={index * 100}>
		<span
			class="flex size-11 items-center justify-center rounded-full border-2 border-ink bg-note text-ink"
		>
			<Icon size={22} weight="bold" />
		</span>
		<h3 class="mt-5 text-base font-semibold tracking-tight text-default">{name}</h3>
		<p class="mt-2 text-sm leading-relaxed text-muted">{body}</p>
	</PaperCard>
{/snippet}

<section id="apps" class="relative scroll-mt-28 bg-meadow px-6 pb-24 pt-16 max-md:pb-16">
	<HillEdge />
	<div class="mx-auto max-w-[1120px]">
		<div class="flex items-end justify-between gap-8">
			<SectionHeading
				eyebrow="Everything else"
				title="The rest of your digital life."
				subtitle="Photos is where most people start. Your files, calendar and contacts come along on the same account, under the same encryption."
			/>
			<Marmot pose="archivist" class="w-[160px] shrink-0 max-md:hidden" />
		</div>

		<div class="mt-12 grid grid-cols-3 gap-6 max-md:grid-cols-1">
			{#each storedApps as app, index (app.name)}
				{@render appCard(app, index)}
			{/each}
		</div>

		<div class="mt-20 max-md:mt-14">
			<SectionHeading
				eyebrow="Apps that work on it"
				title="Not just a place to put things."
				subtitle="Neoworks apps open your photos and files directly, so nothing has to be downloaded, uploaded somewhere else and forgotten there."
			/>
		</div>

		<div class="mt-12 grid grid-cols-3 gap-6 max-md:grid-cols-1">
			{#each workingApps as app, index (app.name)}
				{@render appCard(app, index)}
			{/each}
		</div>
	</div>
</section>

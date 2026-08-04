<script lang="ts">
	import SectionHeading from './SectionHeading.svelte';
	import AppShowcase from './AppShowcase.svelte';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import MapTrifoldIcon from 'phosphor-svelte/lib/MapTrifoldIcon';
	import PaintBrushIcon from 'phosphor-svelte/lib/PaintBrushIcon';
	import { appUrl } from '$lib/urls';

	// Featured app screens. Drop the screenshots into `static/screens/` at the paths
	// below; until then each frame renders a labelled placeholder.
	const screens = [
		{
			name: 'Maps',
			tagline: 'Privacy-first maps, built on your account.',
			description:
				'Live navigation, routing and custom overlays — with every trip stored in your encrypted space instead of a tracking silo.',
			href: appUrl('maps'),
			accent: '#22d3ee',
			icon: MapTrifoldIcon,
			image: '/screens/maps-overlay.png',
			imageAlt: 'Maps app showing a live navigation overlay',
			features: ['Turn-by-turn navigation', 'Custom data overlays', 'Trips never leave your account'],
			external: true
		},
		{
			name: 'Muse',
			tagline: 'An infinite canvas for thinking visually.',
			description:
				'Sketch, arrange media and collaborate on a boundless board. Sync and collaboration are built in — your boards sync through your own encrypted storage.',
			href: appUrl('muse'),
			accent: '#f472b6',
			icon: PaintBrushIcon,
			image: '/screens/muse-canvas.png',
			imageAlt: 'Muse app showing an infinite canvas board',
			features: ['Infinite pan-and-zoom canvas', 'Media and rich embeds', 'Real-time collaboration'],
			external: true
		}
	];
</script>

<section id="apps" class="scroll-mt-28 border-t border-line-faint px-6 py-24 max-md:py-16">
	<div class="mx-auto max-w-[1120px]">
		<SectionHeading
			eyebrow="The ecosystem"
			title="A growing family of apps — all on your account."
			subtitle="Real apps built on NeoWorks today. Each one stores its data in your encrypted space, not its own silo. Anyone can build the next one."
		/>

		<div class="mt-16 flex flex-col gap-20 max-md:gap-14">
			{#each screens as screen, index}
				<AppShowcase {...screen} reverse={index % 2 === 1} />
			{/each}
		</div>

		<!-- Open invitation to the rest of the ecosystem. -->
		<div
			class="mt-16 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-line bg-transparent px-6 py-5"
		>
			<div>
				<h3 class="text-sm font-semibold tracking-tight text-default">Build your own</h3>
				<p class="mt-0.5 text-2xs text-dim">Any app, on the same encrypted layer.</p>
			</div>
			<a
				href="/developers"
				class="group inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-hover hover:text-default"
			>
				Start building
				<ArrowRightIcon
					size={14}
					weight="bold"
					class="transition-transform group-hover:translate-x-0.5"
				/>
			</a>
		</div>
	</div>
</section>

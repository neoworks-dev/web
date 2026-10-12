<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import { scramble } from '$lib/actions/scramble';
	import PaperCard from './scrapbook/PaperCard.svelte';
	import Marmot from './scrapbook/Marmot.svelte';
	import LandscapeEdge from './scrapbook/LandscapeEdge.svelte';
	import KeyIcon from 'phosphor-svelte/lib/KeyIcon';
	import ShieldCheckIcon from 'phosphor-svelte/lib/ShieldCheckIcon';
	import HardDrivesIcon from 'phosphor-svelte/lib/HardDrivesIcon';
	import EyeSlashIcon from 'phosphor-svelte/lib/EyeSlashIcon';

	const storedFiles = [
		{ name: 'IMG_4821.jpg', ciphertext: 'a3f9c1b7e2…' },
		{ name: 'Lisbon, Sunday', ciphertext: '7d2e8f04aa…' },
		{ name: 'Passport scan.pdf', ciphertext: 'c91b3e5d60…' },
		{ name: 'Lena Hoffmann', ciphertext: 'f08a2c7b14…' }
	];

	const guarantees = [
		{
			title: 'Keys derived on your device',
			body: 'Your encryption keys come from your credentials and never leave your devices in usable form. NeoWorks stores keys it cannot use.',
			Icon: KeyIcon
		},
		{
			title: 'We store ciphertext, not content',
			body: 'Photos, files and contacts reach our storage already encrypted. A breach or a subpoena yields scrambled bytes.',
			Icon: ShieldCheckIcon
		},
		{
			title: 'Run it yourself',
			body: 'Do not want to trust us at all? The whole stack is source available and self-hostable. Same apps, your hardware.',
			Icon: HardDrivesIcon
		}
	];
</script>

<!-- The lake. -->
<section id="security" class="relative scroll-mt-28 bg-lake px-6 pb-28 pt-24 max-md:py-16">
	<LandscapeEdge variant="shore" fill="var(--lake)" />
	<div class="mx-auto grid max-w-[1120px] grid-cols-2 items-center gap-12 max-lg:grid-cols-1">
		<!-- Copy -->
		<div use:reveal>
			<span class="inline-block -rotate-2 font-hand text-2xl leading-none text-brand">Your data, encrypted</span>
			<h2
				class="mt-3 text-[clamp(28px,3.5vw,40px)] font-semibold leading-[1.05] tracking-tight text-default"
			>
				Encrypted so thoroughly that even we can’t read it.
			</h2>
			<p class="mt-4 max-w-[460px] text-[15px] leading-relaxed text-muted">
				NeoWorks is built end-to-end encrypted from the ground up. Privacy isn’t a setting you
				switch on — it’s the only way the system works.
			</p>

			<ul class="mt-8 flex flex-col gap-5">
				{#each guarantees as { title, body, Icon }, index (title)}
					<li use:reveal={{ delay: 150 + index * 100 }} class="flex gap-4">
						<span
							class="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-note text-ink"
						>
							<Icon size={20} weight="bold" />
						</span>
						<div>
							<h3 class="text-sm font-semibold tracking-tight text-default">{title}</h3>
							<p class="mt-1 text-sm leading-relaxed text-muted">{body}</p>
						</div>
					</li>
				{/each}
			</ul>
		</div>

		<!-- Device copy next to stored ciphertext, with the guard keeping watch over it. -->
		<div class="relative">
			<Marmot pose="guard" class="absolute -top-36 -right-4 z-10 w-[170px] max-lg:hidden" />
			<PaperCard rotate={1.2} revealDelay={150} class="p-8">
			<div class="flex items-center gap-2.5 text-dim">
				<EyeSlashIcon size={18} weight="duotone" />
				<span class="font-mono text-[11px] uppercase tracking-[0.12em]">The same data, twice</span>
			</div>

			<div class="mt-6 flex px-3 font-mono text-2xs uppercase tracking-[0.1em] text-dim">
				<span class="w-[150px] shrink-0">On your device</span>
				<span>What we store</span>
			</div>

			<div class="mt-2 flex flex-col gap-2">
				{#each storedFiles as file, index (file.ciphertext)}
					<div
						class="flex items-center gap-3 rounded-[3px] bg-paper px-3 py-2.5"
					>
						<span class="w-[138px] shrink-0 truncate text-xs text-muted">
							{file.name}
						</span>
						<span use:scramble={{ delay: 400 + index * 150 }} class="truncate font-mono text-xs text-faint"
							>{file.ciphertext}</span
						>
						<span class="ml-auto font-mono text-2xs text-dim">encrypted</span>
					</div>
				{/each}
			</div>

			<p class="mt-6 text-sm leading-relaxed text-muted">
				Your photo of Lisbon, your passport scan and Lena’s phone number all look like this to us.
				The keys that turn them back into your life stay with you.
			</p>
			</PaperCard>
		</div>
	</div>
</section>

<script lang="ts">
	import ArrowSquareOutIcon from 'phosphor-svelte/lib/ArrowSquareOutIcon';
	import BeforeAfter from './BeforeAfter.svelte';
	import DownloadButton from './DownloadButton.svelte';
	import { latent } from '$lib/latent';

	// Stand-in pair cut from one Pexels frame: the left half is knocked back to
	// look like an ungraded RAW. Swap both for a real export pair out of Latent.
	const sampleFrame = '/hero/8974087.jpg';
	const flatRawLook = 'saturate(0.45) contrast(0.82) brightness(1.06)';
</script>

<!--
	Two layouts. From md up the frame fills the viewport and the copy sits over it.
	Below that it stacks: cropping a landscape frame to a phone's portrait viewport
	loses the composition, and the split handle lands in the middle of the headline.
-->
<section class="relative overflow-hidden bg-canvas md:flex md:min-h-screen md:items-end md:bg-black">
	<div
		class="relative aspect-4/3 w-full overflow-hidden max-md:mt-24 md:absolute md:inset-0 md:mt-0 md:aspect-auto"
	>
		<BeforeAfter
			before={sampleFrame}
			after={sampleFrame}
			beforeFilter={flatRawLook}
			alt="The same frame before and after editing in Latent"
		/>
	</div>

	<!-- Scrim so the copy stays legible over whichever half is showing. -->
	<div
		class="pointer-events-none absolute inset-0 z-10 hidden bg-[linear-gradient(to_top,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.72)_28%,transparent_62%)] md:block"
	></div>

	<!-- Bottom padding clears the RAW/EDITED labels on the frame's bottom edge. -->
	<div
		class="relative z-20 mx-auto w-full max-w-[1240px] px-6 pb-28 max-md:pt-10 max-md:pb-16 md:pointer-events-none"
	>
		<div class="max-w-[620px]">
			<h1
				class="text-[clamp(34px,4.4vw,56px)] leading-[1.05] font-semibold tracking-tight text-default md:text-white"
			>
				The whole negative, not a filter.
			</h1>

			<p
				class="mt-5 max-w-[520px] text-[clamp(15px,1.6vw,18px)] leading-relaxed text-muted md:text-white/70"
			>
				Latent develops your RAW files the way you mean them to look — masks, curves and a history
				you can walk back, every edit reversible. Your photos stay on your disk.
			</p>

			<div class="pointer-events-auto mt-8 flex flex-wrap items-center gap-3">
				<DownloadButton size="lg" />
				<a
					href={latent.sourceUrl}
					class="inline-flex items-center gap-2 rounded-full border border-line bg-elevated/60 px-5 py-3 text-sm font-medium text-muted backdrop-blur-md transition-colors hover:bg-hover hover:text-default md:border-white/20 md:bg-white/5 md:text-white/80 md:hover:bg-white/10 md:hover:text-white"
				>
					View source
					<ArrowSquareOutIcon size={15} weight="bold" />
				</a>
			</div>

			<p
				class="pointer-events-auto mt-4 font-mono text-[11px] tracking-[0.14em] text-balance text-dim uppercase md:text-white/45"
			>
				Free · Open source · Linux x86_64 · macOS later
			</p>
		</div>
	</div>
</section>

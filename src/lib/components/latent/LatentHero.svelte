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

<section class="relative flex min-h-[92vh] items-end overflow-hidden bg-black">
	<BeforeAfter
		before={sampleFrame}
		after={sampleFrame}
		beforeFilter={flatRawLook}
		alt="The same frame before and after editing in Latent"
	/>

	<!-- Scrim so the copy stays legible over whichever half is showing. -->
	<div
		class="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(to_top,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.72)_28%,transparent_62%)]"
	></div>

	<div class="pointer-events-none relative z-20 mx-auto w-full max-w-[1240px] px-6 pb-20 max-md:pb-14">
		<div class="max-w-[620px]">
			<h1 class="text-[clamp(34px,4.4vw,56px)] leading-[1.05] font-semibold tracking-tight text-white">
				The whole negative, not a filter.
			</h1>

			<p class="mt-5 max-w-[520px] text-[clamp(15px,1.6vw,18px)] leading-relaxed text-white/70">
				Latent develops your RAW files the way you mean them to look — masks, curves and a
				history you can walk back, every edit reversible. Your photos stay on your disk.
			</p>

			<div class="pointer-events-auto mt-8 flex flex-wrap items-center gap-3">
				<DownloadButton size="lg" />
				<a
					href={latent.sourceUrl}
					class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-medium text-white/80 backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white"
				>
					View source
					<ArrowSquareOutIcon size={15} weight="bold" />
				</a>
			</div>

			<p class="pointer-events-auto mt-4 font-mono text-[11px] tracking-[0.14em] text-white/45 uppercase">
				Free · Open source · Linux x86_64 · macOS later
			</p>
		</div>
	</div>
</section>

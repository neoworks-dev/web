<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import DotCanvas from './ImageDots/ImageDots.svelte';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';

	// Dots are dark by default; flip to light on the dark theme so the pillars read.
	let theme = $state('dark');
	const dotColor = $derived<[number, number, number]>(
		theme === 'light' ? [0.08, 0.08, 0.1] : [0.9, 0.9, 0.92]
	);

	onMount(() => {
		const root = document.documentElement;
		const read = () => (theme = root.dataset.theme ?? 'dark');
		read();
		const observer = new MutationObserver(read);
		observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
		return () => observer.disconnect();
	});
</script>

<section class="relative flex min-h-screen items-center justify-center overflow-hidden">
	<!-- The three pillars as a dot field with a subtle parallax drift (no hover physics, no ripple). -->
	<DotCanvas
		src="/pillars.png"
		class="absolute inset-0 h-full w-full"
		color={dotColor}
		background={[0, 0, 0, 0]}
		cellSize={5}
		contrast={2}
		scale={0.8}
		ripple={false}
		repelStrength={0}
		parallax={0.04}
	/>

	<!-- Soften the dots behind the copy for legibility. -->
	<div
		class="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_60%_50%_at_center,var(--bg)_25%,transparent_75%)]"
	></div>

	<div class="pointer-events-none relative z-10 w-full max-w-[820px] px-6 pb-28 pt-32 text-center">
		<span
			class="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-line bg-elevated/80 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-dim backdrop-blur-md"
		>
			<span class="size-1.5 rounded-full bg-primary"></span>
			Open beta · one account, every app
		</span>

		<h1
			class="mx-auto mt-6 max-w-[14ch] text-[clamp(40px,5.5vw,68px)] font-semibold leading-[0.98] tracking-tight text-default"
		>
			One account for every app — and it's yours.
		</h1>

		<p class="mx-auto mt-6 max-w-[540px] text-[clamp(15px,1.6vw,18px)] leading-relaxed text-muted">
			NeoWorks is an encrypted identity and data layer. Sign in once and every app in the
			ecosystem reads and writes your data — encrypted with keys only you hold, portable, and
			priced at cost.
		</p>

		<div class="pointer-events-auto mt-9 flex flex-wrap items-center justify-center gap-3">
			<a
				href={resolve('/auth/signup')}
				class="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-inverse transition-opacity hover:opacity-90 active:scale-[0.98]"
			>
				Create your account
				<ArrowRightIcon size={15} weight="bold" />
			</a>
			<a
				href="/#apps"
				class="rounded-full border border-line bg-elevated/60 px-5 py-2.5 text-sm font-medium text-muted backdrop-blur-md transition-colors hover:bg-hover hover:text-default"
			>
				Explore the ecosystem
			</a>
		</div>

		<a
			href="/developers"
			class="pointer-events-auto mt-5 inline-flex items-center gap-1 text-xs font-medium text-dim transition-colors hover:text-default"
		>
			Building an app? Read the developer docs
			<ArrowRightIcon size={12} weight="bold" />
		</a>
	</div>
</section>

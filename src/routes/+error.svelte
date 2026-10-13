<script lang="ts">
	import '@fontsource-variable/geist';
	import '@fontsource-variable/geist-mono';
	import '@fontsource/caveat/500.css';
	import { page } from '$app/state';
	import { copyForStatus } from '$lib/errorCopy';
	import Marmot from '$lib/components/landing/scrapbook/Marmot.svelte';
	import PaperCard from '$lib/components/landing/scrapbook/PaperCard.svelte';

	const copy = $derived(copyForStatus(page.status, page.error?.message));
</script>

<svelte:head>
	<title>{page.status} · Neoworks</title>
</svelte:head>

<main
	data-scene-root
	class="flex min-h-screen items-center justify-center bg-paper px-6 py-16 text-default antialiased"
>
	<div class="flex w-full max-w-[460px] flex-col items-center">
		<Marmot pose={copy.pose} class="relative z-10 -mb-4 h-40 w-auto" />
		<PaperCard rotate={-1} tape={false} class="w-full pt-9 text-center">
			<span class="inline-block -rotate-2 font-hand text-2xl leading-none text-brand">
				{copy.eyebrow}
			</span>
			<h1 class="mt-3 text-[clamp(24px,3vw,32px)] font-semibold leading-tight tracking-tight text-default">
				{copy.title}
			</h1>
			<p class="mt-3 text-[15px] leading-relaxed text-muted">{copy.message}</p>
			<p class="mt-4 font-mono text-xs text-faint">Error {page.status}</p>
			<a
				href="/"
				class="mt-6 inline-block rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-brand-fg transition-colors hover:bg-brand-hover"
			>
				Back to the start
			</a>
		</PaperCard>
	</div>
</main>

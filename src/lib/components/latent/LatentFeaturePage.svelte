<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/stores';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import CheckIcon from 'phosphor-svelte/lib/CheckIcon';
	import DownloadButton from './DownloadButton.svelte';
	import { latentFeatures, latentHref } from '$lib/latent';

	let {
		path,
		title,
		lede,
		points,
		docsHref = '',
		docsLabel = '',
		media
	}: {
		/** This page's own path within the Latent site, e.g. `/sky-replacement`. */
		path: string;
		title: string;
		lede: string;
		points: { title: string; body: string }[];
		docsHref?: string;
		docsLabel?: string;
		media: Snippet;
	} = $props();

	const otherFeatures = $derived(latentFeatures.filter((feature) => feature.path !== path));
</script>

<article>
	<header class="border-b border-line-faint px-6 pt-36 pb-16 max-md:pt-32 max-md:pb-12">
		<div class="mx-auto max-w-[1120px]">
			<span class="font-mono text-[11px] tracking-[0.14em] text-dim uppercase">Latent</span>
			<h1
				class="mt-3 max-w-[760px] text-[clamp(30px,4vw,50px)] leading-[1.06] font-semibold tracking-tight text-default"
			>
				{title}
			</h1>
			<p class="mt-5 max-w-[620px] text-[clamp(15px,1.6vw,18px)] leading-relaxed text-muted">
				{lede}
			</p>

			<div class="mt-8 flex flex-wrap items-center gap-3">
				<DownloadButton size="lg" />
				{#if docsHref}
					<a
						href={docsHref}
						class="inline-flex items-center gap-2 rounded-full border border-line bg-elevated/60 px-5 py-3 text-sm font-medium text-muted transition-colors hover:bg-hover hover:text-default"
					>
						{docsLabel}
						<ArrowRightIcon size={14} weight="bold" />
					</a>
				{/if}
			</div>
		</div>
	</header>

	<section class="px-6 py-16 max-md:py-10">
		<div class="mx-auto max-w-[1120px]">
			{@render media()}
		</div>
	</section>

	<section class="border-t border-line-faint px-6 py-20 max-md:py-14">
		<div class="mx-auto grid max-w-[1120px] gap-4 md:grid-cols-3">
			{#each points as point}
				<div class="rounded-2xl border border-line-faint bg-elevated/50 p-6">
					<span
						class="flex size-9 items-center justify-center rounded-xl border border-line-faint bg-raised text-green"
					>
						<CheckIcon size={16} weight="bold" />
					</span>
					<h2 class="mt-4 text-base font-semibold tracking-tight text-default">{point.title}</h2>
					<p class="mt-1.5 text-sm leading-relaxed text-muted">{point.body}</p>
				</div>
			{/each}
		</div>
	</section>

	<section class="border-t border-line-faint px-6 py-16 max-md:py-12">
		<div class="mx-auto max-w-[1120px]">
			<span class="font-mono text-[11px] tracking-[0.14em] text-dim uppercase">Also in Latent</span>
			<div class="mt-5 flex flex-wrap gap-3">
				{#each otherFeatures as feature}
					<a
						href={latentHref($page.url.hostname, feature.path)}
						class="inline-flex items-center gap-2 rounded-full border border-line-faint bg-elevated/50 px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-hover hover:text-default"
					>
						{feature.label}
						<ArrowRightIcon size={13} weight="bold" />
					</a>
				{/each}
			</div>
		</div>
	</section>
</article>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import CheckIcon from 'phosphor-svelte/lib/CheckIcon';

	let {
		eyebrow,
		title,
		body,
		points = [],
		mediaFirst = false,
		media
	}: {
		eyebrow: string;
		title: string;
		body: string;
		points?: string[];
		/** Puts the media column on the left, so stacked sections alternate. */
		mediaFirst?: boolean;
		media: Snippet;
	} = $props();
</script>

<section class="border-t border-line-faint px-6 py-24 max-md:py-16">
	<div class="mx-auto grid max-w-[1120px] items-center gap-14 md:grid-cols-2 max-md:gap-8">
		<div class:md:order-2={mediaFirst}>
			<span class="font-mono text-[11px] tracking-[0.14em] text-dim uppercase">{eyebrow}</span>
			<h2
				class="mt-3 text-[clamp(26px,3.2vw,38px)] leading-[1.08] font-semibold tracking-tight text-default"
			>
				{title}
			</h2>
			<p class="mt-4 text-[15px] leading-relaxed text-muted">{body}</p>

			{#if points.length > 0}
				<ul class="mt-6 flex flex-col gap-2.5">
					{#each points as point}
						<li class="flex items-start gap-2.5 text-sm leading-relaxed text-muted">
							<CheckIcon size={15} weight="bold" class="mt-1 shrink-0 text-green" />
							{point}
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<div class:md:order-1={mediaFirst}>
			{@render media()}
		</div>
	</div>
</section>

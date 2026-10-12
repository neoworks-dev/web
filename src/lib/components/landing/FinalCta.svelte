<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import { resolve } from '$app/paths';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import MountainBackdrop from './scrapbook/MountainBackdrop.svelte';
</script>

<!-- The page ends back in the mountains, with the marmot home in its burrow. -->
<section class="relative min-h-[720px] overflow-hidden px-6 pt-28 max-md:min-h-[600px] max-md:pt-20">
	<MountainBackdrop parallax={false}>
		{#snippet behindFrontRidge()}
			<img
				src="/marmot/burrow.webp"
				alt=""
				draggable="false"
				class="absolute bottom-[2.5%] left-[44%] w-[220px] max-md:left-[30%] max-md:w-[160px]"
			/>
		{/snippet}
	</MountainBackdrop>
	<!-- Fades the meadow above into this section's sky instead of a hard edge. -->
	<div class="pointer-events-none absolute inset-x-0 top-0 h-48 bg-linear-to-b from-meadow to-transparent"></div>

	<div use:reveal class="relative mx-auto max-w-[640px] text-center">
		<h2 class="text-[clamp(30px,4vw,48px)] font-semibold leading-[1.02] tracking-tight text-default">
			Bring your stuff home.
		</h2>
		<p class="mx-auto mt-5 max-w-[440px] text-[15px] leading-relaxed text-muted">
			Create your account in under a minute, bring your things along, and take them with you
			the day you want to leave.
		</p>

		<div class="mt-8 flex flex-wrap items-center justify-center gap-3">
			<a
				href={resolve('/auth/signup')}
				class="flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-brand-fg transition-colors hover:bg-brand-hover active:scale-[0.98]"
			>
				Start for free
				<ArrowRightIcon size={15} weight="bold" />
			</a>
			<a
				href={resolve('/pricing')}
				class="rounded-md border border-line bg-surface px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-hover hover:text-default"
			>
				See pricing
			</a>
		</div>

		<p
			class="mx-auto mt-8 w-fit rounded-[3px] bg-surface px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted shadow-sm"
		>
			No ads · No tracking · Self-hostable
		</p>
	</div>
</section>

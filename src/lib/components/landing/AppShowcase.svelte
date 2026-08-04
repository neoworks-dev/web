<script lang="ts">
	import type { Component } from 'svelte';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';

	let {
		name,
		tagline,
		description,
		href,
		accent,
		icon,
		image,
		imageAlt,
		features = [],
		badge = '',
		external = false,
		reverse = false
	}: {
		name: string;
		tagline: string;
		description: string;
		href: string;
		accent: string;
		icon: Component;
		/** Path under `static/` — e.g. `/screens/maps-overlay.png`. Drop the file in to fill the frame. */
		image: string;
		imageAlt: string;
		features?: string[];
		badge?: string;
		external?: boolean;
		/** Flip the image to the right on large screens for an alternating rhythm. */
		reverse?: boolean;
	} = $props();

	const Icon = icon;

	// The screenshot is optional — until it exists the frame shows a labelled
	// placeholder instead of a broken-image icon.
	let imageFailed = $state(false);
</script>

<div
	class="grid grid-cols-2 items-center gap-10 max-lg:grid-cols-1 max-lg:gap-6"
	class:lg:[direction:rtl]={reverse}
>
	<!-- Copy column. `direction:ltr` resets the RTL flip applied for alternating layout. -->
	<div class="[direction:ltr] max-lg:order-2">
		<div class="flex items-center gap-2.5">
			<span
				class="flex size-9 items-center justify-center rounded-xl border"
				style="background: color-mix(in oklab, {accent} 16%, transparent); border-color: color-mix(in oklab, {accent} 30%, transparent);"
			>
				<Icon size={18} weight="duotone" color={accent} />
			</span>
			<span class="text-sm font-semibold tracking-tight text-default">{name}</span>
			{#if badge}
				<span
					class="rounded-full border border-line-faint bg-raised px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-dim"
				>
					{badge}
				</span>
			{/if}
		</div>

		<h3 class="mt-4 text-[clamp(22px,2.4vw,30px)] font-semibold leading-[1.1] tracking-tight text-default">
			{tagline}
		</h3>
		<p class="mt-3 max-w-[440px] text-[15px] leading-relaxed text-muted">{description}</p>

		{#if features.length > 0}
			<ul class="mt-5 flex flex-col gap-2">
				{#each features as feature}
					<li class="flex items-center gap-2.5 text-[13px] text-muted">
						<span class="size-1.5 rounded-full" style="background: {accent};"></span>
						{feature}
					</li>
				{/each}
			</ul>
		{/if}

		<a
			{href}
			target={external ? '_blank' : undefined}
			rel={external ? 'noopener noreferrer' : undefined}
			class="group mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-default transition-colors hover:text-muted"
		>
			Explore {name}
			<ArrowRightIcon
				size={14}
				weight="bold"
				class="transition-transform group-hover:translate-x-0.5"
			/>
		</a>
	</div>

	<!-- Screenshot column. -->
	<div class="[direction:ltr] max-lg:order-1">
		<div
			class="relative overflow-hidden rounded-2xl border border-line-faint bg-elevated/50"
			style="box-shadow: 0 30px 80px -40px color-mix(in oklab, {accent} 45%, transparent);"
		>
			<!-- Accent wash so the frame reads as branded even before the image loads. -->
			<div
				class="pointer-events-none absolute inset-0"
				style="background: radial-gradient(120% 120% at 80% 0%, color-mix(in oklab, {accent} 14%, transparent), transparent 60%);"
			></div>

			{#if imageFailed}
				<div
					class="flex aspect-[16/10] flex-col items-center justify-center gap-2 border border-dashed border-line text-center"
				>
					<Icon size={28} weight="duotone" color={accent} />
					<p class="text-xs font-medium text-dim">Add screenshot</p>
					<code class="font-mono text-[10px] text-muted">static{image}</code>
				</div>
			{:else}
				<img
					src={image}
					alt={imageAlt}
					loading="lazy"
					onerror={() => (imageFailed = true)}
					class="relative block aspect-[16/10] w-full object-cover object-top"
				/>
			{/if}
		</div>
	</div>
</div>

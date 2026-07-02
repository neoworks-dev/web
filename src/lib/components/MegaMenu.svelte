<script lang="ts">
	import { fly } from 'svelte/transition';
	import ArrowUpRightIcon from 'phosphor-svelte/lib/ArrowUpRightIcon';
	import { flagships, projectQuickLinks } from '$lib/data/projects';

	let { onNavigate = () => {} }: { onNavigate?: () => void } = $props();
</script>

<div
	role="menu"
	transition:fly={{ y: -6, duration: 180 }}
	class="w-full rounded-3xl border border-line bg-elevated/90 p-6 shadow-[var(--shadow-overlay)] backdrop-blur-xl backdrop-saturate-150"
>
	<div class="grid gap-6 lg:grid-cols-[0.85fr_2.4fr]">
		<!-- Intro + quick links -->
		<section class="flex flex-col">
			<h2 class="text-xl font-semibold tracking-tight text-default">Projects</h2>
			<p class="mt-2 max-w-[34ch] text-sm leading-relaxed text-muted">
				Apps that store their data in your encrypted space, not their own silo. Anyone can build
				the next one.
			</p>

			<div class="mt-5 flex flex-col gap-0.5 border-t border-line-faint pt-4">
				{#each projectQuickLinks as link}
					{@const Icon = link.icon}
					<a
						href={link.href}
						role="menuitem"
						onclick={onNavigate}
						class="group flex items-center gap-3 rounded-lg p-2 text-muted transition-colors duration-fast hover:bg-hover hover:text-default active:scale-[0.985]"
					>
						<span
							class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors"
							style="background: color-mix(in oklab, {link.accent} 14%, transparent); border-color: color-mix(in oklab, {link.accent} 28%, transparent);"
						>
							<Icon size={17} weight="duotone" color={link.accent} />
						</span>
						<span class="flex min-w-0 flex-col gap-px">
							<span class="text-[13px] font-medium tracking-tight text-default">{link.name}</span>
							<span class="truncate text-2xs text-dim">{link.tagline}</span>
						</span>
					</a>
				{/each}
			</div>
		</section>

		<!-- Flagship feature cards -->
		<div class="grid gap-3 sm:grid-cols-2">
			{#each flagships as flagship}
				{@const Icon = flagship.icon}
				<a
					href={flagship.href}
					role="menuitem"
					target={flagship.external ? '_blank' : undefined}
					rel={flagship.external ? 'noopener noreferrer' : undefined}
					onclick={onNavigate}
					class="group relative flex min-h-[148px] flex-col justify-between overflow-hidden rounded-2xl p-5 text-white shadow-lg transition-transform duration-fast hover:-translate-y-0.5 active:scale-[0.99]"
					style="background: {flagship.gradient};"
				>
					<div class="flex items-start justify-between">
						<span
							class="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm"
						>
							<Icon size={22} weight="duotone" color="white" />
						</span>
						{#if flagship.external}
							<ArrowUpRightIcon
								size={16}
								weight="bold"
								class="text-white/70 transition-transform duration-fast group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
							/>
						{:else if flagship.badge}
							<span class="rounded-full bg-white/15 px-2 py-0.5 text-2xs font-medium text-white">
								{flagship.badge}
							</span>
						{/if}
					</div>
					<div class="mt-4">
						<span class="text-lg font-semibold tracking-tight">{flagship.name}</span>
						<p class="mt-1 text-[13px] leading-snug text-white/80">{flagship.blurb}</p>
					</div>
				</a>
			{/each}
		</div>
	</div>

	<div class="mt-5 flex items-center justify-between gap-4 border-t border-line-faint pt-4">
		<span class="text-2xs text-faint">Seven apps. One €2 subscription. Owned by you.</span>
		<a
			href="/#apps"
			onclick={onNavigate}
			class="rounded-md px-2 py-1 text-xs font-medium text-muted transition-colors hover:text-default"
		>
			Explore all projects →
		</a>
	</div>
</div>

<script lang="ts">
	import { fly } from 'svelte/transition';
	import ArrowUpRightIcon from 'phosphor-svelte/lib/ArrowUpRightIcon';
	import { developerMenu } from '$lib/data/projects';

	let { onNavigate = () => {} }: { onNavigate?: () => void } = $props();
</script>

<div
	role="menu"
	transition:fly={{ y: -6, duration: 180 }}
	class="w-full rounded-3xl border border-line bg-elevated/90 p-6 shadow-[var(--shadow-overlay)] backdrop-blur-xl backdrop-saturate-150"
>
	<div class="grid gap-6 lg:grid-cols-[0.85fr_2.4fr]">
		<!-- Intro + CTA card -->
		<section class="flex flex-col">
			<h2 class="text-xl font-semibold tracking-tight text-default">Developers</h2>
			<p class="mt-2 max-w-[34ch] text-sm leading-relaxed text-muted">
				Build apps on NeoWorks and get paid for it. Typed data plane, OpenSchema contracts and
				OAuth scopes out of the box.
			</p>

			<a
				href="/developers"
				role="menuitem"
				onclick={onNavigate}
				class="group mt-5 flex flex-col justify-between overflow-hidden rounded-2xl p-5 text-white shadow-lg transition-transform duration-fast hover:-translate-y-0.5 active:scale-[0.99]"
				style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #0a1f44 100%);"
			>
				<span class="text-base font-semibold tracking-tight">Build &amp; earn</span>
				<span class="mt-1 inline-flex items-center gap-1 text-[13px] text-white/80">
					Start shipping in an afternoon
					<ArrowUpRightIcon
						size={14}
						weight="bold"
						class="transition-transform duration-fast group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
					/>
				</span>
			</a>
		</section>

		<!-- Grouped link columns -->
		<div class="grid gap-x-6 gap-y-5 sm:grid-cols-3">
			{#each developerMenu as column}
				<section>
					<h3 class="mb-2 ml-2 font-mono text-[11px] uppercase tracking-caps text-dim">
						{column.heading}
					</h3>
					<div class="flex flex-col gap-0.5">
						{#each column.items as item}
							{@const Icon = item.icon}
							<a
								href={item.href}
								role="menuitem"
								onclick={onNavigate}
								class="group flex items-center gap-2.5 rounded-md p-2 text-muted transition-colors duration-fast hover:bg-hover hover:text-default active:scale-[0.985]"
							>
								<span
									class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors"
									style="background: color-mix(in oklab, {item.accent} 14%, transparent); border-color: color-mix(in oklab, {item.accent} 28%, transparent);"
								>
									<Icon size={17} weight="duotone" color={item.accent} />
								</span>
								<span class="flex min-w-0 flex-col gap-px">
									<span class="text-[13px] font-medium tracking-tight text-default">{item.name}</span>
									<span class="truncate text-2xs text-dim">{item.tagline}</span>
								</span>
							</a>
						{/each}
					</div>
				</section>
			{/each}
		</div>
	</div>
</div>

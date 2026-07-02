<script lang="ts">
	import SectionHeading from './SectionHeading.svelte';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import PlusCircleIcon from 'phosphor-svelte/lib/PlusCircleIcon';
	import { flagships } from '$lib/data/projects';
</script>

<section id="apps" class="scroll-mt-28 border-t border-line-faint px-6 py-24 max-md:py-16">
	<div class="mx-auto max-w-[1120px]">
		<SectionHeading
			eyebrow="The ecosystem"
			title="A growing family of apps — all on your account."
			subtitle="These are some of the apps built on NeoWorks today. Each one stores its data in your encrypted space, not its own silo. Anyone can build the next one."
		/>

		<div class="mt-12 grid grid-cols-4 gap-3 max-lg:grid-cols-3 max-md:grid-cols-2">
			{#each flagships as app}
				{@const Icon = app.icon}
				<a
					href={app.href}
					target={app.external ? '_blank' : undefined}
					rel={app.external ? 'noopener noreferrer' : undefined}
					class="group flex flex-col gap-3 rounded-2xl border border-line-faint bg-elevated/50 p-5 transition-colors hover:border-line hover:bg-hover"
				>
					<span
						class="flex size-10 items-center justify-center rounded-xl border"
						style="background: color-mix(in oklab, {app.accent} 16%, transparent); border-color: color-mix(in oklab, {app.accent} 30%, transparent);"
					>
						<Icon size={20} weight="duotone" color={app.accent} />
					</span>
					<div>
						<h3 class="text-sm font-semibold tracking-tight text-default">{app.name}</h3>
						<p class="mt-0.5 text-2xs text-dim">{app.blurb}</p>
					</div>
				</a>
			{/each}

			<!-- Open invitation tile. -->
			<a
				href="/developers"
				class="group flex flex-col gap-3 rounded-2xl border border-dashed border-line bg-transparent p-5 transition-colors hover:bg-hover"
			>
				<span
					class="flex size-10 items-center justify-center rounded-xl border border-line-faint bg-raised text-muted"
				>
					<PlusCircleIcon size={20} weight="duotone" />
				</span>
				<div>
					<h3 class="flex items-center gap-1 text-sm font-semibold tracking-tight text-default">
						Build your own
						<ArrowRightIcon
							size={13}
							weight="bold"
							class="-translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
						/>
					</h3>
					<p class="mt-0.5 text-2xs text-dim">Any app, on the same layer</p>
				</div>
			</a>
		</div>
	</div>
</section>

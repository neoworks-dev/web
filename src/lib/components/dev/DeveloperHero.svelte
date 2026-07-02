<script lang="ts">
	import { onMount } from 'svelte';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import ArrowsClockwiseIcon from 'phosphor-svelte/lib/ArrowsClockwiseIcon';
	import ConnectedGraph from './ConnectedGraph.svelte';

	const stats = [
		{ value: '€1.50', label: 'split per active Pro user / mo' },
		{ value: '0%', label: 'taken from your split' },
		{ value: 'OAuth', label: 'standard PKCE, any library' }
	];

	// Dots track the theme so the graph reads on either background.
	let theme = $state('dark');
	const dotColor = $derived(theme === 'light' ? '24,24,27' : '228,228,231');

	onMount(() => {
		const root = document.documentElement;
		const read = () => (theme = root.dataset.theme ?? 'dark');
		read();
		const observer = new MutationObserver(read);
		observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
		return () => observer.disconnect();
	});
</script>

<section class="relative overflow-hidden border-b border-line-faint">
	<div
		class="mx-auto grid max-w-[1120px] grid-cols-2 items-center gap-12 px-6 pb-20 pt-32 max-lg:grid-cols-1 max-lg:gap-8 max-md:px-5 max-md:pt-28"
	>
		<!-- Copy -->
		<div class="relative z-10">
			<span
				class="inline-flex items-center gap-1.5 rounded-full border border-line bg-elevated px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-dim"
			>
				<span class="size-1.5 rounded-full bg-primary"></span>
				Developer platform · Open beta
			</span>

			<h1
				class="mt-6 text-[clamp(38px,5vw,64px)] font-semibold leading-[0.97] tracking-tight text-default"
			>
				Build on a user-owned backend.
			</h1>

			<p class="mt-5 max-w-[480px] text-[clamp(15px,1.6vw,18px)] leading-relaxed text-muted">
				One OAuth login, per-user encrypted storage, real-time sync, and a shared data graph
				across apps — plus a revenue share that lands automatically every month. No auth to build,
				no database to run.
			</p>

			<div class="mt-8 flex flex-wrap items-center gap-3">
				<a
					href="/signup?type=developer"
					class="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-inverse transition-opacity hover:opacity-90 active:scale-[0.98]"
				>
					Register your app
					<ArrowRightIcon size={15} weight="bold" />
				</a>
				<a
					href="/docs"
					class="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-hover hover:text-default"
				>
					Read the docs
				</a>
			</div>

			<div class="mt-12 flex flex-wrap gap-8">
				{#each stats as stat}
					<div>
						<div class="text-2xl font-semibold tracking-tight text-default">{stat.value}</div>
						<div class="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-dim">
							{stat.label}
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Interactive 3D graph -->
		<div class="relative aspect-square w-full max-lg:mx-auto max-lg:max-w-[460px]">
			<!-- Breaks out of the cell to fill the hero and bleed left under the copy. -->
			<div class="absolute inset-0 z-0 lg:inset-y-[-32%] lg:-left-[52%] lg:-right-[14%]">
				<ConnectedGraph color={dotColor} />
			</div>
		</div>
	</div>

	<span
		class="pointer-events-none absolute bottom-5 right-5 z-20 inline-flex items-center gap-1.5 rounded-full border border-line-faint bg-elevated/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-dim backdrop-blur-md max-md:right-4"
	>
		<ArrowsClockwiseIcon size={12} />
		Drag to rotate
	</span>
</section>

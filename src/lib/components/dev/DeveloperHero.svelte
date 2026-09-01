<script lang="ts">
	import { onMount } from 'svelte';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import ConnectedGraph from './ConnectedGraph.svelte';
	import CodeWindow from './CodeWindow.svelte';
	import DevResources from './DevResources.svelte';

	// Dots track the theme so the graph reads on either background.
	let theme = $state('dark');

	function dotColorFor(currentTheme: string): string {
		if (currentTheme === 'light') return '24,24,27';
		return '228,228,231';
	}

	const dotColor = $derived(dotColorFor(theme));

	onMount(() => {
		const root = document.documentElement;
		const read = () => {
			const attribute = root.dataset.theme;
			if (attribute) theme = attribute;
			else theme = 'dark';
		};
		read();
		const observer = new MutationObserver(read);
		observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
		return () => observer.disconnect();
	});
</script>

<section class="relative flex min-h-screen items-center overflow-hidden border-b border-line-faint">
	<!-- Full-bleed so the graph reads as the page's surface, not a panel in a cell.
	     It keeps the pointer: everything above it is transparent to clicks except
	     the links, the code window and the cards. -->
	<div class="absolute inset-0 z-0">
		<ConnectedGraph color={dotColor} />
	</div>

	<!-- Sink the graph behind the copy so the headline never sits on an edge. -->
	<div
		class="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_56%_62%_at_24%_46%,var(--bg)_28%,transparent_78%)]"
	></div>

	<div class="relative z-20 mx-auto w-full max-w-[1360px] px-8 pb-16 pt-32 max-md:px-5 max-md:pt-28">
		<div
			class="grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-center gap-12 max-lg:grid-cols-1 max-lg:gap-10"
		>
			<!-- Copy. Only the interactive bits take the pointer, so the graph stays draggable. -->
			<div class="pointer-events-none">
				<h1
					class="text-[clamp(40px,5.2vw,68px)] font-semibold leading-[0.97] tracking-tight text-default"
				>
					Build on a user-owned backend.
				</h1>

				<p class="mt-5 max-w-[480px] text-[clamp(15px,1.6vw,18px)] leading-relaxed text-muted">
					One OAuth login, per-user encrypted storage, real-time sync, and a shared data graph
					across apps — plus a revenue share that lands automatically every month. No auth to
					build, no database to run.
				</p>

				<div class="pointer-events-auto mt-8 flex flex-wrap items-center gap-3">
					<a
						href="/signup?type=developer"
						class="flex items-center gap-2 rounded-full bg-action px-5 py-2.5 text-sm font-semibold text-action-fg transition-opacity hover:opacity-90 active:scale-[0.98]"
					>
						Register your app
						<ArrowRightIcon size={15} weight="bold" />
					</a>
					<a
						href="/docs"
						class="rounded-full border border-line bg-elevated/60 px-5 py-2.5 text-sm font-medium text-muted backdrop-blur-md transition-colors hover:bg-hover hover:text-default"
					>
						Read the docs
					</a>
				</div>
			</div>

			<div class="pointer-events-auto">
				<CodeWindow />
			</div>
		</div>

		<div class="pointer-events-auto mt-14">
			<DevResources />
		</div>
	</div>
</section>

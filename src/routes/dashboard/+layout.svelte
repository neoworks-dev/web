<script lang="ts">
	import '@fontsource-variable/geist';
	import '@fontsource-variable/geist-mono';
	import '@fontsource/caveat/500.css';
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { LayoutData } from './$types';
	import Sidebar from '$lib/components/dashboard/Sidebar.svelte';
	import DashboardMobileBar from '$lib/components/dashboard/DashboardMobileBar.svelte';
	import { CommandPalette } from '$lib/components/CommandPalette';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();

	let collapsed = $state(false);
	let mobileNavOpen = $state(false);
</script>

<CommandPalette />
<div
	data-scene-root
	class="relative z-10 flex h-screen flex-col gap-3 overflow-hidden bg-paper p-3 text-default antialiased md:flex-row"
>
  <DashboardMobileBar bind:open={mobileNavOpen} />

  {#if mobileNavOpen}
    <button
      type="button"
      aria-label="Close menu"
      class="md:hidden fixed inset-0 z-40 bg-black/50"
      onclick={() => (mobileNavOpen = false)}
      transition:fade={{ duration: 200 }}
    ></button>
  {/if}

  <Sidebar bind:collapsed bind:mobileOpen={mobileNavOpen} user={data.user} developer={data.developer} />

  <main class="flex-1 min-h-0 overflow-hidden" tabindex="-1">
    {@render children()}
  </main>
</div>

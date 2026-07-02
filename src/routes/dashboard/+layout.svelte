<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { LayoutData } from './$types';
	import Sidebar from '$lib/components/dashboard/Sidebar.svelte';
	import DashboardMobileBar from '$lib/components/dashboard/DashboardMobileBar.svelte';
	import { PegboardCanvas } from '@neoworks-dev/ui';
	import { CommandPalette } from '$lib/components/CommandPalette';
	import { createViewContext } from '$lib/context/viewContext.svelte.js';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();

	let collapsed = $state(false);
	let mobileNavOpen = $state(false);
	const viewCtx = createViewContext();
</script>

<PegboardCanvas></PegboardCanvas>
<CommandPalette />
<div class="relative flex flex-col md:flex-row h-screen overflow-hidden p-2 gap-2 z-10">
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

  <Sidebar bind:collapsed bind:mobileOpen={mobileNavOpen} user={data.user} {viewCtx} />

  <main class="flex-1 min-h-0 overflow-hidden" tabindex="-1">
    {@render children()}
  </main>
</div>

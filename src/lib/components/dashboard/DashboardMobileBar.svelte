<script lang="ts">
	import ListIcon from 'phosphor-svelte/lib/ListIcon';
	import XIcon from 'phosphor-svelte/lib/XIcon';

	let { open = $bindable(false) }: { open?: boolean } = $props();
</script>

<!-- Mobile-only top bar with an animated hamburger that toggles the sidebar drawer. -->
<div class="md:hidden flex items-center justify-between h-12 px-3 rounded-lg bg-elevated border border-line-faint shrink-0">
	<span class="flex items-center gap-2 text-default">
		<svg width="22" height="22" viewBox="0 0 100 100" fill="none">
			<circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="7" />
			<path d="M 81 27 C 73 51, 55 69, 26 74" stroke="currentColor" stroke-width="7" stroke-linecap="round" />
		</svg>
		<span class="text-[15px] font-semibold tracking-tight">NeoWorks</span>
	</span>

	<button
		type="button"
		onclick={() => (open = !open)}
		aria-label={open ? 'Close menu' : 'Open menu'}
		aria-expanded={open}
		class="w-8 h-8 flex items-center justify-center rounded-md text-muted hover:text-default hover:bg-hover transition-colors"
	>
		{#if open}
			<XIcon size={18} />
		{:else}
			<ListIcon size={18} />
		{/if}
	</button>
</div>

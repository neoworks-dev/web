<script lang="ts">
	import { Sun, Moon } from 'phosphor-svelte';
	import { onMount } from 'svelte';
	import { readThemeFromDocument, switchTheme, themeState } from '$lib/sky.svelte';

	let { collapsed = false }: { collapsed?: boolean } = $props();

	const isDark = $derived(themeState.current === 'dark');

	const label = $derived.by(() => {
		if (isDark) return 'Light mode';
		return 'Dark mode';
	});

	const tooltip = $derived.by(() => {
		if (collapsed) return label;
		return undefined;
	});

	onMount(readThemeFromDocument);

	function toggle() {
		if (isDark) {
			switchTheme('light');
			return;
		}
		switchTheme('dark');
	}
</script>

<button
	type="button"
	onclick={toggle}
	title={tooltip}
	class="flex items-center gap-[10px] h-9 px-2 rounded-[2px] text-[13px] text-dim hover:bg-hover hover:text-muted transition-colors w-full"
	class:justify-center={collapsed}
>
	<span class="flex shrink-0 w-[18px] h-[18px] items-center justify-center">
		{#if isDark}
			<Sun size={16} />
		{:else}
			<Moon size={16} />
		{/if}
	</span>
	{#if !collapsed}
		<span class="whitespace-nowrap">{label}</span>
	{/if}
</button>

<script lang="ts">
	import SunIcon from 'phosphor-svelte/lib/SunIcon';
	import MoonIcon from 'phosphor-svelte/lib/MoonIcon';
	import { onMount } from 'svelte';
	import { readThemeFromDocument, switchTheme, themeState } from '$lib/sky.svelte';

	let { class: className = '' }: { class?: string } = $props();

	const label = $derived.by(() => {
		if (themeState.current === 'dark') return 'Switch to light mode';
		return 'Switch to dark mode';
	});

	onMount(readThemeFromDocument);

	function toggle() {
		if (themeState.current === 'dark') {
			switchTheme('light');
			return;
		}
		switchTheme('dark');
	}
</script>

<button
	type="button"
	onclick={toggle}
	aria-label={label}
	title={label}
	class="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-hover hover:text-default {className}"
>
	{#if themeState.current === 'dark'}
		<SunIcon size={18} />
	{:else}
		<MoonIcon size={18} />
	{/if}
</button>

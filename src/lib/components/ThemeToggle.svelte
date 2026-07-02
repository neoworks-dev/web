<script lang="ts">
	import SunIcon from 'phosphor-svelte/lib/SunIcon';
	import MoonIcon from 'phosphor-svelte/lib/MoonIcon';
	import { onMount } from 'svelte';

	let { class: className = '' }: { class?: string } = $props();

	let theme = $state('dark');

	onMount(() => {
		theme = localStorage.getItem('theme') ?? document.documentElement.dataset.theme ?? 'dark';
		document.documentElement.dataset.theme = theme;
	});

	function toggle() {
		theme = theme === 'dark' ? 'light' : 'dark';
		document.documentElement.dataset.theme = theme;
		localStorage.setItem('theme', theme);
	}
</script>

<button
	type="button"
	onclick={toggle}
	aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
	title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
	class="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-hover hover:text-default {className}"
>
	{#if theme === 'dark'}
		<SunIcon size={18} />
	{:else}
		<MoonIcon size={18} />
	{/if}
</button>

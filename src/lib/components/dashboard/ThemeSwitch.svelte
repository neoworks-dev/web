<script lang="ts">
	import { Sun, Moon } from 'phosphor-svelte';
	import { onMount } from 'svelte';

	let { collapsed = false }: { collapsed?: boolean } = $props();

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
	title={collapsed ? (theme === 'dark' ? 'Switch to light' : 'Switch to dark') : undefined}
	class="flex items-center gap-[10px] h-9 px-2 rounded-md text-[13px] text-dim hover:bg-hover hover:text-muted transition-colors w-full"
	class:justify-center={collapsed}
>
	<span class="flex shrink-0 w-[18px] h-[18px] items-center justify-center">
		{#if theme === 'dark'}
			<Sun size={16} />
		{:else}
			<Moon size={16} />
		{/if}
	</span>
	{#if !collapsed}
		<span class="whitespace-nowrap">
			{theme === 'dark' ? 'Light mode' : 'Dark mode'}
		</span>
	{/if}
</button>

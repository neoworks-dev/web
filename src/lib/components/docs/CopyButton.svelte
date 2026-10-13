<script lang="ts">
	import CopyIcon from 'phosphor-svelte/lib/CopyIcon';
	import CheckIcon from 'phosphor-svelte/lib/CheckIcon';

	let { text, class: className = '' }: { text: string; class?: string } = $props();

	let copied = $state(false);
	let resetTimer: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		await navigator.clipboard.writeText(text);
		copied = true;
		clearTimeout(resetTimer);
		resetTimer = setTimeout(() => {
			copied = false;
		}, 1600);
	}
</script>

<button
	type="button"
	onclick={copy}
	class={[
		'inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs text-[#a3a3a8] transition-colors hover:bg-white/10 hover:text-[#ece9e1]',
		className
	]}
>
	{#if copied}
		<CheckIcon size={14} weight="bold" />
		<span aria-live="polite">Copied</span>
	{:else}
		<CopyIcon size={14} />
		<span>Copy</span>
	{/if}
</button>

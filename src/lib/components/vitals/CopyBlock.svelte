<script lang="ts">
	import CheckIcon from 'phosphor-svelte/lib/CheckIcon';
	import CopyIcon from 'phosphor-svelte/lib/CopyIcon';

	let {
		code,
		caption = ''
	}: {
		code: string;
		caption?: string;
	} = $props();

	let copied = $state(false);
	let resetTimer: ReturnType<typeof setTimeout>;

	async function copy() {
		await navigator.clipboard.writeText(code);
		copied = true;
		clearTimeout(resetTimer);
		resetTimer = setTimeout(() => (copied = false), 2000);
	}
</script>

<div class="min-w-0 overflow-hidden rounded-2xl border border-line bg-[#0b0d10]">
	<div class="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
		<span class="font-mono text-[11px] tracking-[0.14em] text-white/40 uppercase">{caption}</span>
		<button
			type="button"
			onclick={copy}
			class="flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-[12px] font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
		>
			{#if copied}
				<CheckIcon size={13} weight="bold" />
				Copied
			{:else}
				<CopyIcon size={13} weight="bold" />
				Copy
			{/if}
		</button>
	</div>

	<pre
		class="overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-[1.75] text-white/80">{code}</pre>
</div>

<script lang="ts">
	import { highlightCode } from '$lib/docs/highlight';
	import CopyButton from './CopyButton.svelte';

	type TerminalTab = { label: string; command: string };

	let {
		tabs,
		selectedLabel,
		onSelect
	}: {
		/** One tab per entry, for example one install command per package manager. A single entry hides the tab row. */
		tabs: readonly TerminalTab[];
		/** Controls the selected tab; leave out to let the terminal keep its own selection. */
		selectedLabel?: string;
		onSelect?: (label: string) => void;
	} = $props();

	let ownLabel = $state('');

	const activeLabel = $derived.by(() => {
		if (selectedLabel !== undefined) return selectedLabel;
		if (ownLabel !== '') return ownLabel;
		return tabs[0].label;
	});
	const activeTab = $derived(tabs.find((tab) => tab.label === activeLabel) ?? tabs[0]);
	const lines = $derived(activeTab.command.split('\n'));

	function select(label: string) {
		ownLabel = label;
		onSelect?.(label);
	}
</script>

<div class="code-panel not-prose my-6 overflow-hidden">
	<div class="flex items-center justify-between border-b border-white/10 pl-3 pr-2">
		<div class="flex items-center gap-3">
			<span class="flex gap-1.5" aria-hidden="true">
				<span class="size-2.5 rounded-full bg-[#6f2f2f]"></span>
				<span class="size-2.5 rounded-full bg-[#6b5524]"></span>
				<span class="size-2.5 rounded-full bg-[#2f5d46]"></span>
			</span>
			{#if tabs.length > 1}
				<div role="tablist" class="flex">
					{#each tabs as tab (tab.label)}
						<button
							type="button"
							role="tab"
							aria-selected={tab.label === activeLabel}
							onclick={() => select(tab.label)}
							class={[
								'border-b-2 px-3 py-2 font-mono text-xs transition-colors',
								{
									'border-[#5cbf8c] text-[#ece9e1]': tab.label === activeLabel,
									'border-transparent text-[#a3a3a8] hover:text-[#ece9e1]': tab.label !== activeLabel
								}
							]}
						>
							{tab.label}
						</button>
					{/each}
				</div>
			{:else}
				<span class="py-2 font-mono text-xs text-[#a3a3a8]">terminal</span>
			{/if}
		</div>
		<CopyButton text={activeTab.command} />
	</div>
	<pre class="overflow-x-auto px-4 py-3.5 text-[0.8125rem] leading-relaxed"><code
			>{#each lines as line, index (index)}<span class="select-none text-[#5cbf8c]">$ </span>{@html highlightCode(line, 'bash')}
{/each}</code
		></pre>
</div>

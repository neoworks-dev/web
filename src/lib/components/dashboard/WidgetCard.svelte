<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import type { IconComponentProps } from 'phosphor-svelte/lib/shared';

	let {
		title,
		subtitle,
		icon: Icon,
		children,
	}: {
		title: string;
		subtitle?: string;
		icon?: Component<IconComponentProps>;
		children: Snippet;
	} = $props();
</script>

<div class="rounded-xl bg-elevated border border-line-faint overflow-hidden flex flex-col">
	<div class="px-4 py-2.5 flex items-start gap-2.5 border-b border-line-faint shrink-0">
		{#if Icon}
			<Icon size={14} class="text-dim shrink-0 mt-0.5" />
		{/if}
		<div class="min-w-0">
			<p class="text-[13px] font-medium text-default truncate">{title}</p>
			{#if subtitle}
				<p class="text-[11px] text-dim truncate">{subtitle}</p>
			{/if}
		</div>
	</div>
	<div class="flex-1 min-w-0">
		{@render children()}
	</div>
</div>

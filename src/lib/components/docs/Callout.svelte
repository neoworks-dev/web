<script lang="ts">
	import type { Component, ComponentProps, Snippet } from 'svelte';
	import Marmot from '$lib/components/landing/scrapbook/Marmot.svelte';
	import InfoIcon from 'phosphor-svelte/lib/InfoIcon';
	import LightbulbIcon from 'phosphor-svelte/lib/LightbulbIcon';
	import WarningIcon from 'phosphor-svelte/lib/WarningIcon';
	import WarningOctagonIcon from 'phosphor-svelte/lib/WarningOctagonIcon';

	type CalloutKind = 'note' | 'tip' | 'warning' | 'danger';

	type MarmotPose = ComponentProps<typeof Marmot>['pose'];

	let {
		kind = 'note',
		title = '',
		marmot,
		children
	}: {
		kind?: CalloutKind;
		title?: string;
		/** Overrides the marmot that stands on the callout, which is one of six for its kind. */
		marmot?: MarmotPose;
		children?: Snippet;
	} = $props();

	const marmotVariants = [1, 2, 3, 4, 5, 6] as const;
	const variant = marmotVariants[Math.floor(Math.random() * marmotVariants.length)];

	const kinds: Record<CalloutKind, { label: string; icon: Component }> = {
		note: { label: 'Note', icon: InfoIcon },
		tip: { label: 'Tip', icon: LightbulbIcon },
		warning: { label: 'Careful', icon: WarningIcon },
		danger: { label: 'Danger', icon: WarningOctagonIcon }
	};

	const kindDetails = $derived(kinds[kind]);
	const Icon = $derived(kindDetails.icon);
	const standingMarmot = $derived.by(() => {
		if (marmot !== undefined) return marmot;
		return `callouts/${kind}-${variant}` as const;
	});
	const heading = $derived.by(() => {
		if (title !== '') return title;
		return kindDetails.label;
	});
</script>

<aside
	class={[
		'callout not-prose relative my-6 flex gap-3 rounded-md border-2 border-ink border-l-[6px] px-4 py-3.5',
		{
			'border-l-ink bg-paper': kind === 'note',
			'border-l-brand bg-brand-soft': kind === 'tip',
			'border-l-amber bg-amber-soft': kind === 'warning',
			'border-l-red bg-red-soft': kind === 'danger'
		}
	]}
>
	<Icon
		size={22}
		weight="bold"
		class={[
			'mt-0.5 shrink-0',
			{
				'text-default': kind === 'note',
				'text-brand': kind === 'tip',
				'text-amber': kind === 'warning',
				'text-red': kind === 'danger'
			}
		]}
	/>
	<div class="min-w-0 flex-1 text-base leading-relaxed text-muted">
		<p class="m-0 font-hand text-xl leading-none text-default">{heading}</p>
		<div class="callout-body mt-1.5">
			{@render children?.()}
		</div>
	</div>
	{#if standingMarmot}
		<Marmot pose={standingMarmot} class="-my-1 ml-2 h-[76px] w-auto shrink-0 self-end max-md:hidden" />
	{/if}
</aside>

<script lang="ts">
	import CircleIcon from 'phosphor-svelte/lib/CircleIcon';
	import CircleHalfIcon from 'phosphor-svelte/lib/CircleHalfIcon';
	import PersonIcon from 'phosphor-svelte/lib/PersonIcon';

	// Stand-in for the mask and history rails until a screen capture replaces it.
	const masks = [
		{ label: 'Sky', detail: 'Linear gradient', Icon: CircleHalfIcon },
		{ label: 'Subject', detail: 'Subject select', Icon: PersonIcon },
		{ label: 'Foreground', detail: 'Brush · 2 strokes', Icon: CircleIcon }
	];

	const history = [
		{ label: 'Sky', detail: 'mask changed' },
		{ label: 'Subject', detail: 'added' },
		{ label: 'Curve', detail: 'point moved' },
		{ label: 'Foreground', detail: 'off → on' },
		{ label: 'Punch', detail: 'preset applied' },
		{ label: 'Opened', detail: '' }
	];
</script>

<div class="flex flex-col gap-5 p-6">
	<div class="flex flex-col gap-2">
		<span class="font-mono text-[10px] tracking-[0.16em] text-dim uppercase">Masks</span>
		{#each masks as { label, detail, Icon }}
			<div class="flex items-center gap-3 rounded-xl border border-line-faint bg-elevated/60 px-3 py-2.5">
				<span class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-raised text-muted">
					<Icon size={14} weight="duotone" />
				</span>
				<span class="text-xs font-medium text-default">{label}</span>
				<span class="ml-auto font-mono text-[10px] text-dim">{detail}</span>
			</div>
		{/each}
	</div>

	<div class="flex flex-col gap-1 border-t border-line-faint pt-4">
		<span class="font-mono text-[10px] tracking-[0.16em] text-dim uppercase">History</span>
		{#each history as { label, detail }, index}
			<div
				class="flex items-center justify-between rounded-md px-2 py-1.5 text-xs"
				class:bg-hover={index === 0}
			>
				<span class="text-muted">{label}</span>
				<span class="font-mono text-[10px] text-dim">{detail}</span>
			</div>
		{/each}
	</div>
</div>

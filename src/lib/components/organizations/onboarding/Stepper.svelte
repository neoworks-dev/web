<script lang="ts">
	import CheckIcon from 'phosphor-svelte/lib/CheckIcon';

	let { steps, current }: { steps: string[]; current: number } = $props();
</script>

<div class="space-y-3">
	<div class="flex items-center">
		{#each steps as step, index (step)}
			{@const done = index < current}
			{@const active = index === current}
			<div class="flex items-center gap-2.5">
				<div
					class="flex items-center justify-center w-6 h-6 rounded-full text-[12px] font-semibold shrink-0 transition-colors"
					class:bg-action={done || active}
					class:text-action-fg={done || active}
					class:bg-surface={!done && !active}
					class:text-dim={!done && !active}
					class:border={!done && !active}
					class:border-line={!done && !active}
				>
					{#if done}
						<CheckIcon size={13} weight="bold" />
					{:else}
						{index + 1}
					{/if}
				</div>
				<span
					class="text-[13px] font-medium transition-colors"
					class:text-default={active}
					class:text-muted={done}
					class:text-dim={!done && !active}
				>
					{step}
				</span>
			</div>
			{#if index < steps.length - 1}
				<div class="flex-1 h-px mx-3 bg-line" class:bg-action={index < current}></div>
			{/if}
		{/each}
	</div>
</div>

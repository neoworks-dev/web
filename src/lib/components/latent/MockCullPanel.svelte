<script lang="ts">
	import StarIcon from 'phosphor-svelte/lib/StarIcon';
	import FlagIcon from 'phosphor-svelte/lib/FlagIcon';
	import { heroPhotos } from '$lib/heroPhotos';

	// Stand-in for the library grid until a screen capture replaces it.
	const filters = ['All', 'Picks', 'Rejects', '3★+'];
	const cells = heroPhotos.slice(0, 12);
	const pickedIndexes = [1, 4, 7, 10];
</script>

<div class="flex flex-col gap-4 p-6">
	<div class="flex items-center gap-2">
		{#each filters as filter, index}
			<span
				class="rounded-full border border-line-faint px-3 py-1 font-mono text-[10px] tracking-[0.12em] text-dim uppercase"
				class:bg-raised={index === 1}
				class:text-default={index === 1}
			>
				{filter}
			</span>
		{/each}
		<span class="ml-auto font-mono text-[10px] text-dim">285 photos</span>
	</div>

	<div class="grid grid-cols-4 gap-2">
		{#each cells as cell, index}
			<div class="relative aspect-4/3 overflow-hidden rounded-lg bg-elevated">
				<img src={cell} alt="" class="size-full object-cover" />
				{#if pickedIndexes.includes(index)}
					<span
						class="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm"
					>
						<FlagIcon size={10} weight="fill" />
					</span>
				{/if}
			</div>
		{/each}
	</div>

	<div class="flex items-center gap-1.5 border-t border-line-faint pt-3 text-dim">
		{#each [1, 2, 3, 4, 5] as star}
			<StarIcon size={13} weight="fill" class="text-muted" />
		{/each}
		<span class="ml-2 font-mono text-[10px]">Sorted by capture time</span>
	</div>
</div>

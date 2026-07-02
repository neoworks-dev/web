<script lang="ts">
	type Heading = { id: string; text: string; level: number };

	let { headings, activeIds }: { headings: Heading[]; activeIds: Set<string> } = $props();
</script>

{#if headings.length}
	<nav class="sticky top-28 flex flex-col">
		<h2 class="mb-2 text-2xs font-medium uppercase tracking-[0.12em] text-faint [font-family:var(--font-mono)]">
			On this page
		</h2>
		{#each headings as heading, i}
			{@const active = activeIds.has(heading.id)}
			{@const prev = headings[i - 1]}
			{@const entering = prev && heading.level === 3 && prev.level < 3}
			{@const leaving = prev && heading.level === 2 && prev.level === 3}
			<a
				href={`#${heading.id}`}
				class="relative flex h-8 items-center pl-4 text-sm transition-colors {heading.level === 3
					? 'ml-3'
					: ''} {active ? 'text-default' : 'text-dim hover:text-default'}"
			>
				<!-- Short rail tick, centered in the fixed-height row. -->
				<span
					class="pointer-events-none absolute left-0 inset-y-[3px] w-0.5 rounded-full {active
						? 'bg-line'
						: 'bg-line-faint'}"
				></span>
				{#if entering}
					<!-- 30° branch up-left to the parent rail. -->
					<span
						class="pointer-events-none absolute -left-px top-[3px] h-0.5 w-[13px] origin-left rotate-[207deg] rounded-full {active
							? 'bg-line'
							: 'bg-line-faint'}"
					></span>
				{/if}
				{#if leaving}
					<!-- 30° branch up-right to the indented rail we just left. -->
					<span
						class="pointer-events-none absolute -left-px top-[3px] h-0.5 w-[13px] origin-left -rotate-[27deg] rounded-full {active
							? 'bg-line'
							: 'bg-line-faint'}"
					></span>
				{/if}
				{heading.text}
			</a>
		{/each}
	</nav>
{/if}

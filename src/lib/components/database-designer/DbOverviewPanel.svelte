<script lang="ts">
	import TableIcon from 'phosphor-svelte/lib/TableIcon';
	import LinkIcon from 'phosphor-svelte/lib/LinkIcon';
	import type { CanvasTable, CanvasRelation, SelectionState } from './types';

	let {
		tables,
		relations,
		selection,
		dbName,
		onselect,
	}: {
		tables: CanvasTable[];
		relations: CanvasRelation[];
		selection: SelectionState;
		dbName: string;
		onselect: (s: SelectionState) => void;
	} = $props();
</script>

<div class="flex flex-col h-full">
	{#if dbName}
		<div class="px-3 py-2.5 border-b border-line-faint shrink-0">
			<p class="text-[10px] text-dim uppercase tracking-caps mb-0.5">Database</p>
			<p class="text-[13px] font-mono font-medium text-default truncate">{dbName}</p>
		</div>
	{/if}

	<div class="flex-1 overflow-y-auto px-2 py-2 space-y-3">
		<!-- Tables -->
		<div>
			<div class="flex items-center h-6 px-1 mb-0.5">
				<span class="text-[10px] font-semibold uppercase tracking-caps text-dim">
					Tables ({tables.length})
				</span>
			</div>
			{#each tables as table (table.id)}
				{@const active = selection?.kind === 'table' && selection.id === table.id}
				<button
					type="button"
					onclick={() => onselect({ kind: 'table', id: table.id })}
					class="flex items-center gap-2 w-full h-8 px-2 rounded-md text-[13px] transition-colors duration-fast
						{active ? 'bg-raised text-default' : 'text-muted hover:bg-hover hover:text-default'}"
				>
					<TableIcon size={13} class="shrink-0 {active ? 'text-default' : 'text-dim'}" />
					<span class="flex-1 text-left truncate font-mono text-[12px]">{table.def.name}</span>
					<span class="text-[10px] text-faint tabular-nums">{table.def.fields.length}</span>
				</button>
			{/each}
			{#if tables.length === 0}
				<p class="px-2 py-1 text-[11px] text-faint italic">No tables yet</p>
			{/if}
		</div>

		<!-- Relations -->
		{#if relations.length > 0}
			<div>
				<div class="flex items-center h-6 px-1 mb-0.5">
					<span class="text-[10px] font-semibold uppercase tracking-caps text-dim">
						Relations ({relations.length})
					</span>
				</div>
				{#each relations as rel (rel.id)}
					{@const fromT = tables.find((t) => t.id === rel.fromTableId)}
					{@const toT = tables.find((t) => t.id === rel.toTableId)}
					{@const active = selection?.kind === 'relation' && selection.id === rel.id}
					<button
						type="button"
						onclick={() => onselect({ kind: 'relation', id: rel.id })}
						class="flex items-center gap-2 w-full h-8 px-2 rounded-md transition-colors duration-fast
							{active ? 'bg-raised text-default' : 'text-muted hover:bg-hover hover:text-default'}"
					>
						<LinkIcon size={12} class="shrink-0 {active ? 'text-default' : 'text-dim'}" />
						<span class="flex-1 text-left truncate text-[11px] font-mono">
							{fromT?.def.name} → {toT?.def.name}
						</span>
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>

<script lang="ts">
	import TrashIcon from 'phosphor-svelte/lib/TrashIcon';
	import PlusIcon from 'phosphor-svelte/lib/PlusIcon';
	import XIcon from 'phosphor-svelte/lib/XIcon';
	import type { CanvasTable, CanvasRelation, IndexDef } from './types';

	let {
		table = null,
		relation = null,
		fromTable = null,
		toTable = null,
		onclose,
		ondeleteselection,
		onupdatetable,
		onupdaterelation,
	}: {
		table: CanvasTable | null;
		relation: CanvasRelation | null;
		fromTable: CanvasTable | null;
		toTable: CanvasTable | null;
		onclose: () => void;
		ondeleteselection: () => void;
		onupdatetable: (tableId: string, updater: (t: CanvasTable) => void) => void;
		onupdaterelation: (relId: string, updater: (r: CanvasRelation) => void) => void;
	} = $props();

	function updateTableField(key: 'name', value: string) {
		if (!table) return;
		onupdatetable(table.id, (t) => { if (key === 'name') t.def.name = value; });
	}

	function toggleSchemafull() {
		if (!table) return;
		onupdatetable(table.id, (t) => { t.def.schemafull = !t.def.schemafull; });
	}

	function addField() {
		if (!table) return;
		onupdatetable(table.id, (t) => { t.def.fields.push({ name: '', type: 'string' }); });
	}

	function updateFieldProp(i: number, key: 'name' | 'type', value: string) {
		if (!table) return;
		onupdatetable(table.id, (t) => { t.def.fields[i][key] = value; });
	}

	function removeField(i: number) {
		if (!table) return;
		onupdatetable(table.id, (t) => { t.def.fields.splice(i, 1); });
	}

	function addIndex() {
		if (!table) return;
		onupdatetable(table.id, (t) => { t.def.indexes.push({ name: '', fields: [], unique: false }); });
	}

	function updateIndex(i: number, partial: Partial<IndexDef>) {
		if (!table) return;
		onupdatetable(table.id, (t) => { Object.assign(t.def.indexes[i], partial); });
	}

	function removeIndex(i: number) {
		if (!table) return;
		onupdatetable(table.id, (t) => { t.def.indexes.splice(i, 1); });
	}

	function updateRelationLabel(label: string) {
		if (!relation) return;
		onupdaterelation(relation.id, (r) => { r.label = label; });
	}
</script>

<datalist id="surreal-field-types">
	{#each ['string', 'int', 'float', 'bool', 'datetime', 'array', 'object', 'uuid', 'duration', 'bytes', 'null', 'any', 'number', 'decimal'] as t}
		<option value={t}></option>
	{/each}
</datalist>

<div class="flex flex-col bg-elevated shrink-0 w-72 my-2 mr-2 rounded-xl border border-line-faint shadow-sm">
	<!-- Header -->
	<div class="flex items-center justify-between h-9 px-3 mx-2 mt-1.5 shrink-0">
		<span class="text-[13px] font-medium text-default truncate">
			{#if table}
				{table.def.name}
			{:else if relation && fromTable && toTable}
				{fromTable.def.name} → {toTable.def.name}
			{/if}
		</span>
		<div class="flex items-center gap-0.5 shrink-0">
			<button
				type="button"
				onclick={ondeleteselection}
				class="flex items-center justify-center h-7 w-7 rounded-md text-dim hover:text-red hover:bg-red-soft transition-colors duration-fast"
				title="Delete"
			>
				<TrashIcon size={13} />
			</button>
			<button
				type="button"
				onclick={onclose}
				class="flex items-center justify-center h-7 w-7 rounded-md text-dim hover:text-default hover:bg-hover transition-colors duration-fast"
				aria-label="Close"
			>
				<XIcon size={13} />
			</button>
		</div>
	</div>

	<!-- Divider -->
	<div class="h-px bg-line-faint mt-1.5 shrink-0"></div>

	<!-- Content -->
	<div class="flex-1 overflow-y-auto px-3 py-3 space-y-4">
		{#if table}
			<!-- Name -->
			<div class="space-y-1.5">
				<label class="text-[10px] font-semibold uppercase tracking-caps text-dim" for="tbl-name">
					Name
				</label>
				<input
					id="tbl-name"
					type="text"
					value={table.def.name}
					oninput={(e) => updateTableField('name', (e.target as HTMLInputElement).value)}
					class="w-full h-7 px-2 rounded-md border border-line-faint bg-input text-[12px] font-mono text-default focus:outline-none focus:border-line-strong transition-colors duration-fast"
				/>
			</div>

			<!-- Schemafull -->
			<div class="flex items-center justify-between gap-3">
				<div>
					<p class="text-[13px] text-default">Schemafull</p>
					<p class="text-[11px] text-dim">Reject undeclared fields</p>
				</div>
				<button
					type="button"
					onclick={toggleSchemafull}
					class="relative w-9 h-5 rounded-full shrink-0 transition-colors duration-fast
						{table.def.schemafull ? 'bg-accent' : 'bg-surface border border-line-faint'}"
					role="switch"
					aria-checked={table.def.schemafull}
				>
					<span
						class="absolute top-0.5 w-4 h-4 rounded-full transition-all duration-fast
							{table.def.schemafull ? 'bg-canvas translate-x-[18px]' : 'bg-muted translate-x-0.5'}"
					></span>
				</button>
			</div>

			<!-- Fields -->
			<div class="space-y-1.5">
				<div class="flex items-center justify-between h-6">
					<span class="text-[10px] font-semibold uppercase tracking-caps text-dim">Fields</span>
					<button
						type="button"
						onclick={addField}
						class="flex items-center gap-1 h-6 px-2 rounded-md text-[11px] text-dim hover:text-default hover:bg-hover transition-colors duration-fast"
					>
						<PlusIcon size={11} />
						Add
					</button>
				</div>

				{#each table.def.fields as field, i (i)}
					<div class="flex items-center gap-1">
						<input
							type="text"
							value={field.name}
							placeholder="field_name"
							oninput={(e) => updateFieldProp(i, 'name', (e.target as HTMLInputElement).value)}
							class="flex-1 min-w-0 h-7 px-2 rounded-md border border-line-faint bg-input text-[11px] font-mono text-default placeholder:text-faint focus:outline-none focus:border-line-strong transition-colors duration-fast"
						/>
						<input
							type="text"
							value={field.type}
							placeholder="string"
							list="surreal-field-types"
							oninput={(e) => updateFieldProp(i, 'type', (e.target as HTMLInputElement).value)}
							class="w-20 h-7 px-2 rounded-md border border-line-faint bg-input text-[11px] font-mono text-default placeholder:text-faint focus:outline-none focus:border-line-strong transition-colors duration-fast"
						/>
						<button
							type="button"
							onclick={() => removeField(i)}
							class="h-7 w-7 flex items-center justify-center rounded-md text-dim hover:text-red hover:bg-red-soft transition-colors duration-fast shrink-0"
							aria-label="Remove field"
						>
							<TrashIcon size={11} />
						</button>
					</div>
				{/each}

				{#if table.def.fields.length === 0}
					<p class="text-[11px] text-faint italic px-1">No fields defined.</p>
				{/if}
			</div>

			<!-- Indexes -->
			<div class="space-y-1.5">
				<div class="flex items-center justify-between h-6">
					<span class="text-[10px] font-semibold uppercase tracking-caps text-dim">Indexes</span>
					<button
						type="button"
						onclick={addIndex}
						class="flex items-center gap-1 h-6 px-2 rounded-md text-[11px] text-dim hover:text-default hover:bg-hover transition-colors duration-fast"
					>
						<PlusIcon size={11} />
						Add
					</button>
				</div>

				{#each table.def.indexes as idx, i (i)}
					<div class="space-y-1 p-2 rounded-lg border border-line-faint bg-surface">
						<div class="flex items-center gap-1">
							<input
								type="text"
								value={idx.name}
								placeholder="idx_name"
								oninput={(e) => updateIndex(i, { name: (e.target as HTMLInputElement).value })}
								class="flex-1 h-6 min-w-0 px-2 rounded-md border border-line-faint bg-input text-[11px] font-mono text-default placeholder:text-faint focus:outline-none focus:border-line-strong transition-colors duration-fast"
							/>
							<button
								type="button"
								onclick={() => removeIndex(i)}
								class="h-6 w-6 flex items-center justify-center rounded-md text-dim hover:text-red hover:bg-red-soft transition-colors duration-fast shrink-0"
								aria-label="Remove index"
							>
								<TrashIcon size={11} />
							</button>
						</div>
						<input
							type="text"
							value={idx.fields.join(', ')}
							placeholder="field1, field2"
							oninput={(e) =>
								updateIndex(i, {
									fields: (e.target as HTMLInputElement).value
										.split(',')
										.map((s) => s.trim())
										.filter(Boolean),
								})}
							class="w-full h-6 px-2 rounded-md border border-line-faint bg-input text-[11px] font-mono text-default placeholder:text-faint focus:outline-none focus:border-line-strong transition-colors duration-fast"
						/>
						<label class="flex items-center gap-2 text-[11px] text-muted cursor-pointer select-none px-0.5">
							<input
								type="checkbox"
								checked={idx.unique}
								onchange={(e) => updateIndex(i, { unique: (e.target as HTMLInputElement).checked })}
								class="w-3 h-3 rounded accent-accent"
							/>
							Unique
						</label>
					</div>
				{/each}

				{#if table.def.indexes.length === 0}
					<p class="text-[11px] text-faint italic px-1">No indexes defined.</p>
				{/if}
			</div>

		{:else if relation && fromTable && toTable}
			<div class="space-y-1.5">
				<span class="text-[10px] font-semibold uppercase tracking-caps text-dim">From</span>
				<div class="h-7 px-2 rounded-md border border-line-faint bg-surface text-[12px] font-mono text-muted flex items-center">
					{fromTable.def.name}
				</div>
			</div>
			<div class="space-y-1.5">
				<span class="text-[10px] font-semibold uppercase tracking-caps text-dim">To</span>
				<div class="h-7 px-2 rounded-md border border-line-faint bg-surface text-[12px] font-mono text-muted flex items-center">
					{toTable.def.name}
				</div>
			</div>
			<div class="space-y-1.5">
				<label class="text-[10px] font-semibold uppercase tracking-caps text-dim" for="rel-label">
					Field Name
				</label>
				<input
					id="rel-label"
					type="text"
					value={relation.label}
					oninput={(e) => updateRelationLabel((e.target as HTMLInputElement).value)}
					class="w-full h-7 px-2 rounded-md border border-line-faint bg-input text-[12px] font-mono text-default focus:outline-none focus:border-line-strong transition-colors duration-fast"
				/>
				<p class="text-[11px] text-dim px-0.5">
					Added to <span class="font-mono text-muted">{fromTable.def.name}</span> as
					<span class="font-mono text-muted">record&lt;{toTable.def.name}&gt;</span>
				</p>
			</div>
		{/if}
	</div>
</div>

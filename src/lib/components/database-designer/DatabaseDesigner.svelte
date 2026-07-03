<script lang="ts">
	import { SchemaDiagram, layoutTables } from '@neoworks-dev/ui';
	import ArrowsOutIcon from 'phosphor-svelte/lib/ArrowsOutIcon';
	import InfoIcon from 'phosphor-svelte/lib/InfoIcon';
	import WarningIcon from 'phosphor-svelte/lib/WarningIcon';
	import { compileClientSchema } from './compileSchema';
	import CodeEditor from './CodeEditor.svelte';

	let {
		onconfirm,
		oncancel,
	}: {
		onconfirm: (name: string, schemaSource: string) => Promise<void>;
		oncancel: () => void;
	} = $props();

	const STARTER_SOURCE = `namespace app

/// A todo item. Each row is automatically owned by the signed-in user.
model Todo {
  1 title: string
  2 done: bool
  3 due: timestamp?
}
`;

	let dbName = $state('');
	let source = $state(STARTER_SOURCE);
	let confirming = $state(false);
	let createError = $state<string | null>(null);

	// Compile the DSL to the final table structure on every edit. Pure + in-browser,
	// so the diagram tracks the editor live.
	const compiled = $derived(compileClientSchema(source));
	const diagramTables = $derived(layoutTables(compiled.tables, compiled.relations));
	const errors = $derived(compiled.diagnostics.filter((d) => d.severity === 'error'));
	const warnings = $derived(compiled.diagnostics.filter((d) => d.severity === 'warning'));

	// One-line rationale per server-managed field, shown so the author understands
	// fields they never wrote. Keyed by the exact injected field name.
	const INJECTED_EXPLANATIONS: Record<string, string> = {
		subject_user_id: 'Links each row to the signed-in user who created it — the data API enforces per-user row ownership from this.',
		created_at: 'Server-set insert timestamp, so rows can be sorted by recency.',
		updated_at: 'Server-set last-modified timestamp.',
		version: 'Points at the current row in the append-only history table (this table requested history).',
		grantee_user_id: 'On the share-grant companion table: the user a shared row is granted to.',
		row: 'On the share-grant companion table: the shared row the grant applies to.',
	};
	const injectedExplained = $derived(
		compiled.injectedFields
			.filter((name) => INJECTED_EXPLANATIONS[name] !== undefined)
			.map((name) => ({ name, why: INJECTED_EXPLANATIONS[name] }))
	);

	const canCreate = $derived(dbName.trim().length > 0 && errors.length === 0 && !confirming);

	// ── Right-pane pan/zoom (read-only view) ──────────────────────────────
	let canvasEl: HTMLElement;
	let panX = $state(40);
	let panY = $state(40);
	let zoom = $state(1);
	let isPanning = $state(false);
	let panStart = $state({ mx: 0, my: 0, px: 0, py: 0 });

	function onWheel(e: WheelEvent) {
		e.preventDefault();
		const rect = canvasEl.getBoundingClientRect();
		const mx = e.clientX - rect.left;
		const my = e.clientY - rect.top;
		const factor = e.deltaY > 0 ? 0.92 : 1 / 0.92;
		const newZoom = Math.max(0.2, Math.min(4, zoom * factor));
		panX = mx - (mx - panX) * (newZoom / zoom);
		panY = my - (my - panY) * (newZoom / zoom);
		zoom = newZoom;
	}

	function onPointerDown(e: PointerEvent) {
		if (e.button !== 0 && e.button !== 1) return;
		isPanning = true;
		panStart = { mx: e.clientX, my: e.clientY, px: panX, py: panY };
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function onPointerMove(e: PointerEvent) {
		if (!isPanning) return;
		panX = panStart.px + (e.clientX - panStart.mx);
		panY = panStart.py + (e.clientY - panStart.my);
	}

	function onPointerUp() {
		isPanning = false;
	}

	function resetView() {
		panX = 40;
		panY = 40;
		zoom = 1;
	}

	async function handleConfirm() {
		if (!canCreate) return;
		confirming = true;
		createError = null;
		try {
			await onconfirm(dbName.trim(), source);
		} catch (e) {
			createError = e instanceof Error ? e.message : 'Failed to create database';
		} finally {
			confirming = false;
		}
	}
</script>

<div class="relative flex flex-col h-full bg-elevated rounded-lg border border-line-faint overflow-hidden">
	<!-- Toolbar -->
	<div class="flex items-center gap-2 px-4 h-[56px] border-b border-line-faint shrink-0">
		<input
			type="text"
			bind:value={dbName}
			placeholder="database-name"
			class="h-7 w-44 px-2.5 rounded-lg border border-line-faint bg-input text-[13px] font-mono text-default placeholder:text-dim focus:outline-none focus:border-line-strong transition-colors duration-fast"
		/>

		{#if createError}
			<span class="text-[12px] text-red truncate max-w-[40%]">{createError}</span>
		{/if}

		<div class="ml-auto flex items-center gap-2">
			<button
				type="button"
				onclick={oncancel}
				class="h-7 px-3 rounded text-[12px] text-dim hover:text-default border border-transparent hover:border-line-faint transition-colors duration-fast"
			>
				Cancel
			</button>
			<button
				type="button"
				onclick={handleConfirm}
				disabled={!canCreate}
				class="flex items-center gap-2 h-7 px-4 rounded text-[12px] font-medium bg-primary text-inverse hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity duration-fast"
			>
				{#if confirming}<span class="loading loading-spinner loading-xs"></span>{/if}
				Create Database
			</button>
		</div>
	</div>

	<!-- Editor (left) + read-only diagram (right) -->
	<div class="flex flex-1 min-h-0">
		<!-- DSL editor -->
		<div class="flex flex-col w-[42%] min-w-[320px] border-r border-line-faint">
			<div class="flex items-center gap-2 px-3 h-9 shrink-0 border-b border-line-faint">
				<span class="text-[11px] font-semibold uppercase tracking-caps text-dim">OpenSchema</span>
				<a
					href="/docs/neoworks/openschema"
					target="_blank"
					rel="noreferrer"
					class="text-[11px] text-accent hover:underline ml-auto"
				>OpenSchema reference</a>
			</div>
			<div class="flex-1 min-h-0 bg-elevated px-1">
				<CodeEditor bind:value={source} placeholder="Define your models here…" />
			</div>

			<!-- Diagnostics -->
			{#if errors.length > 0 || warnings.length > 0}
				<div class="shrink-0 max-h-40 overflow-y-auto border-t border-line-faint bg-surface px-3 py-2 space-y-1">
					{#each errors as d}
						<div class="flex items-start gap-1.5 text-[11.5px] text-red">
							<WarningIcon size={13} class="mt-0.5 shrink-0" />
							<span class="font-mono">{d.message}</span>
						</div>
					{/each}
					{#each warnings as d}
						<div class="flex items-start gap-1.5 text-[11.5px] text-amber">
							<WarningIcon size={13} class="mt-0.5 shrink-0" />
							<span class="font-mono">{d.message}</span>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Read-only structure preview -->
		<div class="relative flex-1 flex flex-col min-w-0">
			<div class="flex items-center gap-2 px-3 h-9 shrink-0 border-b border-line-faint">
				<span class="text-[11px] font-semibold uppercase tracking-caps text-dim">Final structure</span>
				<span class="text-[11px] text-faint">read-only</span>
				<button
					type="button"
					onclick={resetView}
					title="Reset view"
					class="ml-auto flex items-center justify-center h-6 w-6 rounded text-dim hover:text-default hover:bg-hover transition-colors duration-fast"
				>
					<ArrowsOutIcon size={13} />
				</button>
			</div>

			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				bind:this={canvasEl}
				class="flex-1 relative overflow-hidden select-none {isPanning ? 'cursor-grabbing' : 'cursor-grab'}"
				onpointerdown={onPointerDown}
				onpointermove={onPointerMove}
				onpointerup={onPointerUp}
				onwheel={onWheel}
			>
				<SchemaDiagram tables={diagramTables} relations={compiled.relations} {panX} {panY} {zoom} />

				{#if diagramTables.length === 0}
					<div class="absolute inset-0 flex items-center justify-center pointer-events-none">
						<p class="text-[13px] text-dim">
							{errors.length > 0 ? 'Fix the errors to preview the structure' : 'Define a model to preview the structure'}
						</p>
					</div>
				{/if}
			</div>

			<!-- Explain server-injected fields -->
			{#if injectedExplained.length > 0}
				<div class="shrink-0 border-t border-line-faint bg-surface px-3 py-2.5">
					<div class="flex items-center gap-1.5 mb-1.5">
						<InfoIcon size={13} class="text-accent shrink-0" />
						<span class="text-[11px] font-semibold text-default">Server-managed fields</span>
						<span class="text-[11px] text-dim">— added automatically, shown dimmed above</span>
					</div>
					<ul class="space-y-1">
						{#each injectedExplained as item}
							<li class="text-[11.5px] text-muted leading-snug">
								<code class="text-[11px] text-accent font-mono">{item.name}</code>
								<span class="text-dim">— {item.why}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	</div>
</div>

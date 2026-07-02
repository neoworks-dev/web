<script lang="ts">
	import { onMount } from 'svelte';
	import ConfigPanel from './ConfigPanel.svelte';
	import DbOverviewPanel from './DbOverviewPanel.svelte';
	import { SchemaDiagram } from '@neoworks-dev/ui';
	import PlusIcon from 'phosphor-svelte/lib/PlusIcon';
	import LinkIcon from 'phosphor-svelte/lib/LinkIcon';
	import ArrowsOutIcon from 'phosphor-svelte/lib/ArrowsOutIcon';
	import CursorIcon from 'phosphor-svelte/lib/CursorIcon';
	import HandIcon from 'phosphor-svelte/lib/HandIcon';
	import TreeStructureIcon from 'phosphor-svelte/lib/TreeStructureIcon';
	import BoundingBoxIcon from 'phosphor-svelte/lib/BoundingBoxIcon';
	import type { CanvasTable, CanvasRelation, CanvasGroup, SelectionState, TableDef } from './types';
	import { TABLE_W, TABLE_HEADER_H, TABLE_ROW_H, snap, GROUP_COLORS } from './types';
	import { palette } from '$lib/components/CommandPalette/commandPalette.svelte.js';
	import { useViewContext } from '$lib/context/viewContext.svelte.js';

	let {
		onconfirm,
		oncancel,
	}: {
		onconfirm: (name: string, schema: { tables: TableDef[] }) => Promise<void>;
		oncancel: () => void;
	} = $props();

	let tables = $state<CanvasTable[]>([]);
	let relations = $state<CanvasRelation[]>([]);
	let groups = $state<CanvasGroup[]>([]);
	let selection = $state<SelectionState>(null);
	let selectedTableIds = $state<string[]>([]);

	let panX = $state(40);
	let panY = $state(40);
	let zoom = $state(1);
	let isPanning = $state(false);
	let panStart = $state({ mx: 0, my: 0, px: 0, py: 0 });

	let tool = $state<'select' | 'pan' | 'connect'>('select');
	let connectFrom = $state<string | null>(null);

	let dragging = $state<{
		tableId: string;
		startMX: number;
		startMY: number;
		offsets: { id: string; origX: number; origY: number }[];
	} | null>(null);

	let marquee = $state<{ sx: number; sy: number; ex: number; ey: number } | null>(null);
	let marqueeStartClient = $state<{ mx: number; my: number } | null>(null);

	let dbName = $state('');
	let confirming = $state(false);

	let ctxMenu = $state<{
		screenX: number;
		screenY: number;
		canvasX: number;
		canvasY: number;
		onTable: string | null;
		onRelation: string | null;
	} | null>(null);

	let newGroupDialog = $state<{ label: string; color: string } | null>(null);

	let canvasEl: HTMLElement;

	const selectedTable = $derived(
		selection?.kind === 'table' ? (tables.find((t) => t.id === selection!.id) ?? null) : null
	);
	const selectedRelation = $derived(
		selection?.kind === 'relation'
			? (relations.find((r) => r.id === selection!.id) ?? null)
			: null
	);
	const selectedRelationFrom = $derived(
		selectedRelation ? (tables.find((t) => t.id === selectedRelation.fromTableId) ?? null) : null
	);
	const selectedRelationTo = $derived(
		selectedRelation ? (tables.find((t) => t.id === selectedRelation.toTableId) ?? null) : null
	);
	const panelVisible = $derived(
		selection !== null &&
			(selectedTable !== null ||
				(selectedRelation !== null &&
					selectedRelationFrom !== null &&
					selectedRelationTo !== null))
	);

	// ── View context ─────────────────────────────────────────────

	const viewCtx = useViewContext();

	$effect(() => {
		viewCtx.setSidebarPanel({
			component: DbOverviewPanel,
			label: 'Databases',
			onback: oncancel,
			props: () => ({
				tables,
				relations,
				selection,
				dbName,
				onselect: (s: SelectionState) => {
					selection = s;
					selectedTableIds = s?.kind === 'table' ? [s.id] : [];
				},
			}),
		});
		return () => viewCtx.setSidebarPanel(null);
	});

	// ── Table management ──────────────────────────────────────────

	function tableBottom(t: CanvasTable): number {
		const rows = Math.max(1, t.def.fields.length);
		return t.y + TABLE_HEADER_H + 8 + rows * TABLE_ROW_H;
	}

	function addTable(canvasX?: number, canvasY?: number) {
		const id = crypto.randomUUID();
		const offset = tables.length * 40;
		tables.push({
			id,
			x: snap(canvasX ?? 64 + offset),
			y: snap(canvasY ?? 64 + offset),
			def: { name: `table_${tables.length + 1}`, schemafull: false, fields: [], indexes: [] },
		});
		selectedTableIds = [id];
		selection = { kind: 'table', id };
	}

	function deleteSelected() {
		if (selectedTableIds.length > 0) {
			for (const tid of [...selectedTableIds]) {
				const idx = tables.findIndex((t) => t.id === tid);
				if (idx >= 0) tables.splice(idx, 1);
				for (let i = relations.length - 1; i >= 0; i--) {
					if (relations[i].fromTableId === tid || relations[i].toTableId === tid)
						relations.splice(i, 1);
				}
				for (const g of groups) {
					const gi = g.tableIds.indexOf(tid);
					if (gi >= 0) g.tableIds.splice(gi, 1);
				}
			}
			selectedTableIds = [];
			if (selection?.kind === 'table') selection = null;
		} else if (selection?.kind === 'relation') {
			const rid = selection.id;
			const rel = relations.find((r) => r.id === rid);
			if (rel) {
				const fromTable = tables.find((t) => t.id === rel.fromTableId);
				if (fromTable) {
					const fi = fromTable.def.fields.findIndex((f) => f.name === rel.label);
					if (fi >= 0) fromTable.def.fields.splice(fi, 1);
				}
				const ri = relations.findIndex((r) => r.id === rid);
				if (ri >= 0) relations.splice(ri, 1);
			}
			selection = null;
		}
	}

	// ── Auto-organize ─────────────────────────────────────────────

	function organizeLayout() {
		if (tables.length === 0) return;
		const HGAP = 80;
		const VGAP = 48;

		const outEdges = new Map<string, string[]>();
		const inDegree = new Map<string, number>();
		for (const t of tables) { outEdges.set(t.id, []); inDegree.set(t.id, 0); }
		for (const r of relations) {
			outEdges.get(r.fromTableId)?.push(r.toTableId);
			inDegree.set(r.toTableId, (inDegree.get(r.toTableId) ?? 0) + 1);
		}

		const depth = new Map<string, number>();
		const queue: string[] = [];
		for (const t of tables) {
			if ((inDegree.get(t.id) ?? 0) === 0) { depth.set(t.id, 0); queue.push(t.id); }
		}
		while (queue.length > 0) {
			const id = queue.shift()!;
			const d = depth.get(id)!;
			for (const nb of outEdges.get(id) ?? []) {
				if (!depth.has(nb) || depth.get(nb)! < d + 1) {
					depth.set(nb, d + 1);
					queue.push(nb);
				}
			}
		}
		let maxD = 0;
		for (const v of depth.values()) maxD = Math.max(maxD, v);
		for (const t of tables) { if (!depth.has(t.id)) depth.set(t.id, maxD + 1); }

		const cols = new Map<number, string[]>();
		for (const t of tables) {
			const d = depth.get(t.id)!;
			if (!cols.has(d)) cols.set(d, []);
			cols.get(d)!.push(t.id);
		}

		const sortedCols = [...cols.keys()].sort((a, b) => a - b);
		for (let ci = 0; ci < sortedCols.length; ci++) {
			const col = cols.get(sortedCols[ci])!;
			const x = snap(64 + ci * (TABLE_W + HGAP));
			let y = 64;
			for (const id of col) {
				const t = tables.find((t) => t.id === id);
				if (!t) continue;
				t.x = x;
				t.y = snap(y);
				y += TABLE_HEADER_H + 8 + Math.max(1, t.def.fields.length) * TABLE_ROW_H + VGAP;
			}
		}
		resetView();
	}

	// ── Groups ────────────────────────────────────────────────────

	function openGroupDialog() {
		if (selectedTableIds.length < 2) return;
		newGroupDialog = { label: '', color: 'violet' };
	}

	function confirmNewGroup() {
		if (!newGroupDialog || selectedTableIds.length < 2) return;
		groups.push({
			id: crypto.randomUUID(),
			label: newGroupDialog.label || 'Group',
			color: newGroupDialog.color,
			tableIds: [...selectedTableIds],
		});
		newGroupDialog = null;
	}

	// ── Zoom ──────────────────────────────────────────────────────

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

	function resetView() {
		panX = 40;
		panY = 40;
		zoom = 1;
	}

	// ── Canvas pointer events ─────────────────────────────────────

	function clientToCanvas(cx: number, cy: number) {
		const rect = canvasEl.getBoundingClientRect();
		return { x: (cx - rect.left - panX) / zoom, y: (cy - rect.top - panY) / zoom };
	}

	function onCanvasMouseDown(e: MouseEvent) {
		if (e.button === 1) e.preventDefault();
	}

	function onCanvasPointerDown(e: PointerEvent) {
		ctxMenu = null;

		if (e.button === 1) {
			e.preventDefault();
			isPanning = true;
			panStart = { mx: e.clientX, my: e.clientY, px: panX, py: panY };
			(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
			return;
		}
		if (e.button !== 0) return;

		if (tool === 'pan') {
			isPanning = true;
			panStart = { mx: e.clientX, my: e.clientY, px: panX, py: panY };
			(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
			return;
		}
		if (tool === 'connect') return;

		const onTable = (e.target as HTMLElement).closest('[data-table-id]');
		if (onTable) return;

		// Start marquee on empty canvas
		const { x, y } = clientToCanvas(e.clientX, e.clientY);
		marqueeStartClient = { mx: e.clientX, my: e.clientY };
		marquee = { sx: x, sy: y, ex: x, ey: y };
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function onCanvasPointerMove(e: PointerEvent) {
		if (isPanning) {
			panX = panStart.px + (e.clientX - panStart.mx);
			panY = panStart.py + (e.clientY - panStart.my);
		}
		if (marquee) {
			const { x, y } = clientToCanvas(e.clientX, e.clientY);
			marquee = { ...marquee, ex: x, ey: y };
		}
		if (dragging) {
			const dx = (e.clientX - dragging.startMX) / zoom;
			const dy = (e.clientY - dragging.startMY) / zoom;
			for (const { id, origX, origY } of dragging.offsets) {
				const t = tables.find((t) => t.id === id);
				if (t) { t.x = snap(origX + dx); t.y = snap(origY + dy); }
			}
		}
	}

	function onCanvasPointerUp(e: PointerEvent) {
		if (isPanning) { isPanning = false; return; }

		if (marquee && marqueeStartClient) {
			const moved =
				Math.abs(e.clientX - marqueeStartClient.mx) > 4 ||
				Math.abs(e.clientY - marqueeStartClient.my) > 4;
			if (moved) {
				const minX = Math.min(marquee.sx, marquee.ex);
				const maxX = Math.max(marquee.sx, marquee.ex);
				const minY = Math.min(marquee.sy, marquee.ey);
				const maxY = Math.max(marquee.sy, marquee.ey);
				const ids = tables
					.filter((t) => t.x < maxX && t.x + TABLE_W > minX && t.y < maxY && tableBottom(t) > minY)
					.map((t) => t.id);
				selectedTableIds = ids;
				selection = ids.length === 1 ? { kind: 'table', id: ids[0] } : null;
			} else {
				selectedTableIds = [];
				selection = null;
			}
			marquee = null;
			marqueeStartClient = null;
		}

		dragging = null;
	}

	function onCanvasContextMenu(e: MouseEvent) {
		e.preventDefault();
		const { x, y } = clientToCanvas(e.clientX, e.clientY);
		const tableTarget = (e.target as HTMLElement).closest<HTMLElement>('[data-table-id]');
		const relTarget = (e.target as Element).closest<Element>('[data-rel-id]');
		ctxMenu = {
			screenX: e.clientX,
			screenY: e.clientY,
			canvasX: x,
			canvasY: y,
			onTable: tableTarget?.dataset.tableId ?? null,
			onRelation: relTarget?.getAttribute('data-rel-id') ?? null,
		};
	}

	function closeCtxMenu() { ctxMenu = null; }

	// ── Table interactions ────────────────────────────────────────

	function onTableHeaderPointerDown(e: PointerEvent, tableId: string) {
		if (tool !== 'select') return;
		e.stopPropagation();

		const isSelected = selectedTableIds.includes(tableId);
		const dragIds = isSelected && selectedTableIds.length > 1 ? selectedTableIds : [tableId];
		if (!isSelected) {
			selectedTableIds = [tableId];
			selection = { kind: 'table', id: tableId };
		}

		dragging = {
			tableId,
			startMX: e.clientX,
			startMY: e.clientY,
			offsets: dragIds.map((id) => {
				const t = tables.find((t) => t.id === id)!;
				return { id, origX: t.x, origY: t.y };
			}),
		};
		canvasEl.setPointerCapture(e.pointerId);
	}

	function onTableSelect(e: MouseEvent, tableId: string) {
		e.stopPropagation();
		if (tool === 'connect') {
			if (!connectFrom) {
				connectFrom = tableId;
			} else if (connectFrom !== tableId) {
				createRelation(connectFrom, tableId);
				connectFrom = null;
				tool = 'select';
			}
			return;
		}
		if (tool !== 'select') return;
		if (e.shiftKey || e.metaKey) {
			if (selectedTableIds.includes(tableId)) {
				selectedTableIds = selectedTableIds.filter((id) => id !== tableId);
			} else {
				selectedTableIds = [...selectedTableIds, tableId];
			}
			selection = selectedTableIds.length === 1
				? { kind: 'table', id: selectedTableIds[0] }
				: null;
		} else {
			selectedTableIds = [tableId];
			selection = { kind: 'table', id: tableId };
		}
	}

	// ── Relations ────────────────────────────────────────────────

	function createRelation(fromId: string, toId: string) {
		const fromTable = tables.find((t) => t.id === fromId);
		const toTable = tables.find((t) => t.id === toId);
		if (!fromTable || !toTable) return;
		const label = toTable.def.name;
		fromTable.def.fields.push({ name: label, type: `record<${toTable.def.name}>` });
		const id = crypto.randomUUID();
		relations.push({ id, fromTableId: fromId, toTableId: toId, label });
		selection = { kind: 'relation', id };
		selectedTableIds = [];
	}

	function onRelationClick(e: MouseEvent, relId: string) {
		e.stopPropagation();
		selection = { kind: 'relation', id: relId };
		selectedTableIds = [];
	}

	// ── Config panel callbacks ────────────────────────────────────

	function onUpdateTable(tableId: string, updater: (t: CanvasTable) => void) {
		const t = tables.find((t) => t.id === tableId);
		if (t) updater(t);
	}

	function onUpdateRelation(relId: string, updater: (r: CanvasRelation) => void) {
		const r = relations.find((r) => r.id === relId);
		if (!r) return;
		const oldLabel = r.label;
		updater(r);
		if (r.label !== oldLabel) {
			const fromTable = tables.find((t) => t.id === r.fromTableId);
			const toTable = tables.find((t) => t.id === r.toTableId);
			if (fromTable) {
				const field = fromTable.def.fields.find((f) => f.name === oldLabel);
				if (field) {
					field.name = r.label;
					if (toTable) field.type = `record<${toTable.def.name}>`;
				}
			}
		}
	}

	// ── Keyboard ─────────────────────────────────────────────────

	function onKeydown(e: KeyboardEvent) {
		if ((e.target as HTMLElement).tagName === 'INPUT') return;
		if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected();
		if (e.key === 'Escape') {
			ctxMenu = null;
			newGroupDialog = null;
			if (tool === 'connect') { tool = 'select'; connectFrom = null; }
			else { selection = null; selectedTableIds = []; marquee = null; }
		}
		if (e.key === 'v' || e.key === 'V') { tool = 'select'; connectFrom = null; }
		if (e.key === 'h' || e.key === 'H') { tool = 'pan'; connectFrom = null; }
	}

	// ── Palette commands ──────────────────────────────────────────

	onMount(() => {
		return palette.register([
			{ id: 'db-add-table', label: 'Add Table', group: 'Database Designer', action: () => addTable() },
			{
				id: 'db-connect-mode',
				label: 'Toggle Connect Mode',
				group: 'Database Designer',
				action: () => { tool = tool === 'connect' ? 'select' : 'connect'; connectFrom = null; },
			},
			{ id: 'db-organize', label: 'Organize Layout', group: 'Database Designer', action: organizeLayout },
			{
				id: 'db-delete-selected',
				label: 'Delete Selected',
				group: 'Database Designer',
				disabled: () => selectedTableIds.length === 0 && !selection,
				action: deleteSelected,
			},
			{ id: 'db-reset-view', label: 'Reset View', group: 'Database Designer', action: resetView },
		]);
	});

	// ── Confirm ───────────────────────────────────────────────────

	async function handleConfirm() {
		if (!dbName.trim() || confirming) return;
		confirming = true;
		try {
			await onconfirm(dbName.trim(), { tables: tables.map((t) => t.def) });
		} finally {
			confirming = false;
		}
	}
</script>

<svelte:window onkeydown={onKeydown} />

<div class="relative flex flex-col h-full bg-elevated rounded-lg border border-line-faint overflow-hidden">
	<!-- Toolbar -->
	<div class="flex items-center gap-2 px-4 h-[56px] border-b border-line-faint shrink-0">
		<input
			type="text"
			bind:value={dbName}
			placeholder="database-name"
			class="h-7 w-44 px-2.5 rounded-lg border border-line-faint bg-input text-[13px] font-mono text-default placeholder:text-dim focus:outline-none focus:border-line-strong transition-colors duration-fast"
		/>

		<div class="w-px h-5 bg-line-faint mx-1"></div>

		{#if tool === 'connect'}
			<div class="flex items-center gap-1.5 h-7 px-3 rounded text-[12px] text-accent border border-accent/40 bg-accent/10">
				<LinkIcon size={13} />
				{connectFrom ? 'Click target table' : 'Click source table'}
				<span class="text-dim ml-1">— Esc to cancel</span>
			</div>
		{/if}

		<div class="ml-auto flex items-center gap-2">
			<span class="font-mono text-[11px] text-dim tabular-nums">{Math.round(zoom * 100)}%</span>
			<button
				type="button"
				onclick={resetView}
				title="Reset view"
				class="flex items-center justify-center h-7 w-7 rounded text-dim hover:text-default hover:bg-hover border border-transparent hover:border-line-faint transition-colors duration-fast"
			>
				<ArrowsOutIcon size={13} />
			</button>
			<div class="w-px h-5 bg-line-faint"></div>
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
				disabled={!dbName.trim() || confirming}
				class="flex items-center gap-2 h-7 px-4 rounded text-[12px] font-medium bg-primary text-inverse hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity duration-fast"
			>
				{#if confirming}<span class="loading loading-spinner loading-xs"></span>{/if}
				Create Database
			</button>
		</div>
	</div>

	<!-- Canvas + config panel -->
	<div class="flex flex-1 min-h-0">
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			bind:this={canvasEl}
			class="flex-1 relative overflow-hidden select-none
				{isPanning || tool === 'pan' ? 'cursor-grabbing' : tool === 'connect' ? 'cursor-crosshair' : 'cursor-default'}"
			onmousedown={onCanvasMouseDown}
			onpointerdown={onCanvasPointerDown}
			onpointermove={onCanvasPointerMove}
			onpointerup={onCanvasPointerUp}
			oncontextmenu={onCanvasContextMenu}
			onwheel={onWheel}
		>
			<SchemaDiagram
				{tables}
				{relations}
				{groups}
				{selection}
				{selectedTableIds}
				{panX}
				{panY}
				{zoom}
				connectMode={tool === 'connect'}
				{connectFrom}
				onrelationclick={onRelationClick}
				ontableselect={onTableSelect}
				ontableheaderpointerdown={onTableHeaderPointerDown}
			/>

			<!-- Marquee -->
			{#if marquee}
				{@const mx = Math.min(marquee.sx, marquee.ex) * zoom + panX}
				{@const my = Math.min(marquee.sy, marquee.ey) * zoom + panY}
				{@const mw = Math.abs(marquee.ex - marquee.sx) * zoom}
				{@const mh = Math.abs(marquee.ey - marquee.sy) * zoom}
				<div
					style="position:absolute; left:{mx}px; top:{my}px; width:{mw}px; height:{mh}px; border:1px solid rgba(167,139,250,0.6); background:rgba(167,139,250,0.07); pointer-events:none; z-index:10;"
				></div>
			{/if}

			<!-- Empty state -->
			{#if tables.length === 0}
				<div class="absolute inset-0 flex items-center justify-center pointer-events-none z-[3]">
					<div class="text-center space-y-2">
						<p class="text-[13px] text-dim">
							Right-click or press <kbd class="font-mono text-[11px] border border-line rounded px-1.5 py-0.5 text-muted">⌘P</kbd> to add a table
						</p>
						<p class="text-[11px] text-faint">Scroll to zoom · Middle-drag to pan · Drag to select</p>
					</div>
				</div>
			{/if}

			<!-- Connect hint -->
			{#if tool === 'connect'}
				<div class="absolute bottom-14 left-1/2 -translate-x-1/2 pointer-events-none z-[3]">
					<div class="px-3 py-1.5 rounded-lg bg-elevated border border-accent/30 text-[12px] text-muted shadow-md">
						{connectFrom ? 'Click target table' : 'Click source table'}
						— <span class="text-dim">Esc to cancel</span>
					</div>
				</div>
			{/if}

			<!-- Bottom toolbar -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="absolute bottom-3 left-1/2 -translate-x-1/2 z-[5] flex items-center gap-0.5 h-9 px-2 rounded-xl bg-elevated border border-line-faint shadow-md"
				onpointerdown={(e) => e.stopPropagation()}
			>
				<button
					type="button"
					onclick={() => { tool = 'select'; connectFrom = null; }}
					title="Select (V)"
					class="flex items-center justify-center h-7 w-7 rounded-lg transition-colors duration-fast
						{tool === 'select' ? 'bg-raised text-default' : 'text-dim hover:text-default hover:bg-hover'}"
				><CursorIcon size={14} /></button>
				<button
					type="button"
					onclick={() => { tool = 'pan'; connectFrom = null; }}
					title="Pan (H)"
					class="flex items-center justify-center h-7 w-7 rounded-lg transition-colors duration-fast
						{tool === 'pan' ? 'bg-raised text-default' : 'text-dim hover:text-default hover:bg-hover'}"
				><HandIcon size={14} /></button>
				<button
					type="button"
					onclick={() => { tool = tool === 'connect' ? 'select' : 'connect'; connectFrom = null; }}
					title="Connect tables"
					class="flex items-center justify-center h-7 w-7 rounded-lg transition-colors duration-fast
						{tool === 'connect' ? 'bg-raised text-accent' : 'text-dim hover:text-default hover:bg-hover'}"
				><LinkIcon size={14} /></button>

				<div class="w-px h-5 bg-line-faint mx-1"></div>

				<button
					type="button"
					onclick={organizeLayout}
					title="Organize layout"
					class="flex items-center justify-center h-7 w-7 rounded-lg text-dim hover:text-default hover:bg-hover transition-colors duration-fast"
				><TreeStructureIcon size={14} /></button>

				{#if selectedTableIds.length >= 2}
					<div class="w-px h-5 bg-line-faint mx-1"></div>
					<button
						type="button"
						onclick={openGroupDialog}
						title="Group selected tables"
						class="flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[11px] font-medium text-accent hover:bg-accent/10 transition-colors duration-fast"
					>
						<BoundingBoxIcon size={13} />
						Group {selectedTableIds.length}
					</button>
				{/if}

				<div class="w-px h-5 bg-line-faint mx-1"></div>

				<button
					type="button"
					onclick={() => addTable()}
					title="Add table"
					class="flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[11px] text-dim hover:text-default hover:bg-hover transition-colors duration-fast"
				>
					<PlusIcon size={13} />
					Table
				</button>
			</div>
		</div>

		{#if panelVisible}
			<ConfigPanel
				table={selectedTable}
				relation={selectedRelation}
				fromTable={selectedRelationFrom}
				toTable={selectedRelationTo}
				onclose={() => { selection = null; selectedTableIds = []; }}
				ondeleteselection={deleteSelected}
				onupdatetable={onUpdateTable}
				onupdaterelation={onUpdateRelation}
			/>
		{/if}
	</div>

	<!-- Group creation dialog -->
	{#if newGroupDialog !== null}
		<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
		<div
			class="absolute inset-0 flex items-center justify-center z-[50] bg-canvas/60 backdrop-blur-sm"
			onclick={() => { newGroupDialog = null; }}
		>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="bg-elevated border border-line-faint rounded-xl shadow-xl p-5 w-72 space-y-4"
				onclick={(e) => e.stopPropagation()}
			>
				<h3 class="text-[13px] font-semibold text-default">New Group</h3>
				<div class="space-y-1.5">
					<label class="text-[10px] font-semibold uppercase tracking-caps text-dim" for="group-name">Name</label>
					<input
						id="group-name"
						type="text"
						bind:value={newGroupDialog.label}
						placeholder="Group name"
						autofocus
						class="w-full h-7 px-2.5 rounded-md border border-line-faint bg-input text-[12px] text-default focus:outline-none focus:border-line-strong transition-colors duration-fast"
					/>
				</div>
				<div class="space-y-2">
					<span class="text-[10px] font-semibold uppercase tracking-caps text-dim">Color</span>
					<div class="flex gap-2">
						{#each Object.entries(GROUP_COLORS) as [key, c]}
							<button
								type="button"
								onclick={() => { if (newGroupDialog) newGroupDialog.color = key; }}
								style="background:{c.bg}; border:2px solid {newGroupDialog.color === key ? c.text : c.border}; width:22px; height:22px; border-radius:50%; cursor:pointer;"
								title={c.label}
							></button>
						{/each}
					</div>
				</div>
				<div class="flex gap-2 justify-end pt-1">
					<button
						type="button"
						onclick={() => { newGroupDialog = null; }}
						class="h-7 px-3 rounded-lg text-[12px] text-dim hover:text-default border border-line-faint transition-colors duration-fast"
					>Cancel</button>
					<button
						type="button"
						onclick={confirmNewGroup}
						class="h-7 px-4 rounded-lg text-[12px] font-medium bg-primary text-inverse hover:opacity-90 transition-opacity duration-fast"
					>Create</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<!-- Context menu -->
{#if ctxMenu}
	<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
	<div
		class="fixed inset-0 z-[100]"
		onclick={closeCtxMenu}
		oncontextmenu={(e) => { e.preventDefault(); closeCtxMenu(); }}
	>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="absolute min-w-[168px] rounded-xl border border-line bg-elevated shadow-lg py-1 overflow-hidden"
			style="left:{ctxMenu.screenX}px; top:{ctxMenu.screenY}px;"
			onclick={(e) => e.stopPropagation()}
		>
			{#if ctxMenu.onRelation}
				{@const rel = relations.find((r) => r.id === ctxMenu!.onRelation)}
				{#if rel}
					{@const fromT = tables.find((t) => t.id === rel.fromTableId)}
					{@const toT = tables.find((t) => t.id === rel.toTableId)}
					<div class="px-3 py-1.5 text-[10px] font-semibold text-dim uppercase tracking-caps border-b border-line-faint mb-1">
						{fromT?.def.name} → {toT?.def.name}
					</div>
					<button class="ctx-row" onclick={() => { selection = { kind: 'relation', id: ctxMenu!.onRelation! }; closeCtxMenu(); }}>
						Edit Relation
					</button>
					<div class="h-px bg-line-faint my-1 mx-2"></div>
					<button class="ctx-row danger" onclick={() => { selection = { kind: 'relation', id: ctxMenu!.onRelation! }; deleteSelected(); closeCtxMenu(); }}>
						Delete Relation
					</button>
				{/if}
			{:else if ctxMenu.onTable}
				{@const tbl = tables.find((t) => t.id === ctxMenu!.onTable)}
				{#if tbl}
					<div class="px-3 py-1.5 text-[10px] font-semibold text-dim uppercase tracking-caps border-b border-line-faint mb-1">
						{tbl.def.name}
					</div>
					<button class="ctx-row" onclick={() => { const id = ctxMenu!.onTable!; selectedTableIds = [id]; selection = { kind: 'table', id }; closeCtxMenu(); }}>
						Edit Table
					</button>
					<button class="ctx-row" onclick={() => { connectFrom = ctxMenu!.onTable; tool = 'connect'; closeCtxMenu(); }}>
						<LinkIcon size={13} class="text-dim" />
						Connect From Here
					</button>
					<div class="h-px bg-line-faint my-1 mx-2"></div>
					<button class="ctx-row danger" onclick={() => { const id = ctxMenu!.onTable!; selectedTableIds = [id]; if (selection?.kind !== 'table' || selection.id !== id) selection = null; deleteSelected(); closeCtxMenu(); }}>
						Delete Table
					</button>
				{/if}
			{:else}
				<button class="ctx-row" onclick={() => { addTable(ctxMenu!.canvasX, ctxMenu!.canvasY); closeCtxMenu(); }}>
					<PlusIcon size={13} class="text-dim" />
					Add Table Here
				</button>
				{#if selectedTableIds.length >= 2}
					<button class="ctx-row" onclick={() => { openGroupDialog(); closeCtxMenu(); }}>
						<BoundingBoxIcon size={13} class="text-dim" />
						Group Selected ({selectedTableIds.length})
					</button>
				{/if}
				<button class="ctx-row" onclick={() => { organizeLayout(); closeCtxMenu(); }}>
					<TreeStructureIcon size={13} class="text-dim" />
					Organize Layout
				</button>
				<div class="h-px bg-line-faint my-1 mx-2"></div>
				<button
					class="ctx-row {tool === 'connect' ? 'text-accent' : ''}"
					onclick={() => { tool = tool === 'connect' ? 'select' : 'connect'; connectFrom = null; closeCtxMenu(); }}
				>
					<LinkIcon size={13} class={tool === 'connect' ? 'text-accent' : 'text-dim'} />
					{tool === 'connect' ? 'Exit Connect Mode' : 'Connect Tables'}
				</button>
				{#if selectedTableIds.length > 0 || selection}
					<div class="h-px bg-line-faint my-1 mx-2"></div>
					<button class="ctx-row danger" onclick={() => { deleteSelected(); closeCtxMenu(); }}>
						Delete Selected
					</button>
				{/if}
			{/if}
		</div>
	</div>
{/if}

<style>
	.ctx-row {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		height: 32px;
		padding: 0 12px;
		font-size: 13px;
		text-align: left;
		white-space: nowrap;
		color: var(--text-default);
		transition: background-color 0.1s;
	}
	.ctx-row:hover {
		background: var(--bg-hover);
	}
	.ctx-row.danger {
		color: var(--ctx-red, #f87171);
	}
	.ctx-row.danger:hover {
		background: var(--bg-red-soft);
	}
</style>

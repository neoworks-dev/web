<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import { scale } from 'svelte/transition';
	import { backOut, cubicIn } from 'svelte/easing';
	import { menuReveal, menuHide } from '$lib/transitions';
	import PlusIcon from 'phosphor-svelte/lib/PlusIcon';
	import LockKeyIcon from 'phosphor-svelte/lib/LockKeyIcon';
	import LockKeyOpenIcon from 'phosphor-svelte/lib/LockKeyOpenIcon';
	import ArrowCounterClockwiseIcon from 'phosphor-svelte/lib/ArrowCounterClockwiseIcon';
	import ArrowClockwiseIcon from 'phosphor-svelte/lib/ArrowClockwiseIcon';
	import SquaresFourIcon from 'phosphor-svelte/lib/SquaresFourIcon';
	import { palette } from '$lib/components/CommandPalette/commandPalette.svelte.js';
	import { reflowToBounds, findDropSpot } from '$lib/widgetGrid';
	import { overlayScroll } from '$lib/actions/overlayScroll';
    import { PegboardCanvas } from '@neoworks-dev/ui';

	export interface WidgetLayout {
		id: string;
		type?: string;
		x: number;
		y: number;
		w: number;
		h: number;
		locked?: boolean;
		suggestedW?: number;
		suggestedH?: number;
	}

	export interface AvailableWidget {
		type: string;
		label: string;
		defaultW: number;
		defaultH: number;
	}

	interface DragState {
		id: string;
		originX: number;
		originY: number;
		ghostX: number;
		ghostY: number;
	}

	interface ResizeState {
		id: string;
		startX: number;
		startY: number;
		startW: number;
		startH: number;
		ghostW: number;
		ghostH: number;
	}

	let {
		layouts = $bindable<WidgetLayout[]>([]),
		availableWidgets = [],
		snap = 8,
		gap = 8,
		minW = 128,
		minH = 96,
		storageKey = '',
		widget,
	}: {
		layouts: WidgetLayout[];
		availableWidgets?: AvailableWidget[];
		snap?: number;
		gap?: number;
		minW?: number;
		minH?: number;
		storageKey?: string;
		widget: Snippet<[WidgetLayout, {
			ondraghandlepointerdown: (e: PointerEvent) => void;
			onresizehandlepointerdown: (e: PointerEvent) => void;
			locked: boolean;
			isFullscreen: boolean;
			suggestedSize: { w: number; h: number } | null;
			globalLocked: boolean;
			ontogglelock: () => void;
			onremove: () => void;
			onresizetosuggested: () => void;
			onfullscreen: () => void;
			ontogglglobalelock: () => void;
		}]>;
	} = $props();

	let gridEl = $state<HTMLElement | null>(null);
	let gridW = $state(0);
	let gridH = $state(0);

	let drag = $state<DragState | null>(null);
	let resize = $state<ResizeState | null>(null);
	let globalLocked = $state(false);
	let fullscreenId = $state<string | null>(null);
	let gridMenu = $state<{ x: number; y: number; gridX: number; gridY: number } | null>(null);

	let history  = $state<WidgetLayout[][]>([]);
	let future   = $state<WidgetLayout[][]>([]);
	let hydrated = $state(false);

	onMount(() => {
		if (storageKey) {
			try {
				const saved = localStorage.getItem(storageKey);
				if (saved) {
					const parsed = JSON.parse(saved) as WidgetLayout[];
					if (parsed.length > 0) layouts = parsed;
				}
			} catch {}
		}
		hydrated = true;
	});

	$effect(() => {
		if (!hydrated || !storageKey) return;
		localStorage.setItem(storageKey, JSON.stringify(layouts));
	});

	function snapshot() {
		history = [...history, layouts.map(l => ({ ...l }))];
		future = [];
	}
	function undo() {
		if (!history.length) return;
		future = [...future, layouts.map(l => ({ ...l }))];
		layouts = history[history.length - 1];
		history = history.slice(0, -1);
	}
	function redo() {
		if (!future.length) return;
		history = [...history, layouts.map(l => ({ ...l }))];
		layouts = future[future.length - 1];
		future = future.slice(0, -1);
	}

	$effect(() => {
		if (!gridEl) return;
		const ro = new ResizeObserver(() => {
			gridW = gridEl!.clientWidth;
			gridH = gridEl!.clientHeight;
		});
		ro.observe(gridEl);
		return () => ro.disconnect();
	});

	$effect(() => {
		if (!fullscreenId) return;
		const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') fullscreenId = null; };
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});

	$effect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (!e.ctrlKey && !e.metaKey) return;
			if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
			if (e.key === 'Z' &&  e.shiftKey) { e.preventDefault(); redo(); }
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});

	$effect(() => {
		return palette.register([
			{
				id: 'grid-undo',
				label: 'Undo',
				group: 'Layout',
				icon: ArrowCounterClockwiseIcon,
				shortcut: 'Ctrl+Z',
				disabled: () => history.length === 0,
				action: undo,
			},
			{
				id: 'grid-redo',
				label: 'Redo',
				group: 'Layout',
				icon: ArrowClockwiseIcon,
				shortcut: 'Ctrl+Shift+Z',
				disabled: () => future.length === 0,
				action: redo,
			},
			{
				id: 'grid-toggle-lock',
				label: globalLocked ? 'Unfreeze layout' : 'Freeze layout',
				group: 'Layout',
				icon: globalLocked ? LockKeyOpenIcon : LockKeyIcon,
				action: toggleGlobalLock,
			},
		]);
	});

	function snapPx(px: number): number { return Math.round(px / snap) * snap; }
	function snapCeil(px: number): number { return Math.ceil(px / snap) * snap; }
	function snapFloor(px: number): number { return Math.floor(px / snap) * snap; }

	function clampX(x: number, w: number): number {
		return Math.max(0, Math.min(gridW - w, snapPx(x)));
	}
	function clampY(y: number, h: number): number {
		return Math.max(0, Math.min(gridH - h, snapPx(y)));
	}

	function cornersOverlap(a: WidgetLayout, b: WidgetLayout): boolean {
		const buf = gap;
		const inB = (x: number, y: number) =>
			x > b.x - buf && x < b.x + b.w + buf && y > b.y - buf && y < b.y + b.h + buf;
		const inA = (x: number, y: number) =>
			x > a.x - buf && x < a.x + a.w + buf && y > a.y - buf && y < a.y + a.h + buf;
		return (
			inB(a.x, a.y)       || inB(a.x + a.w, a.y)       ||
			inB(a.x, a.y + a.h) || inB(a.x + a.w, a.y + a.h) ||
			inA(b.x, b.y)       || inA(b.x + b.w, b.y)       ||
			inA(b.x, b.y + b.h) || inA(b.x + b.w, b.y + b.h)
		);
	}

	function resolveCollisions(
		list: WidgetLayout[],
		anchorId: string,
		displaceThreshold = 0,
	): { result: WidgetLayout[]; success: boolean } {
		const anchor = list.find(l => l.id === anchorId)!;
		const others = list.filter(l => l.id !== anchorId);
		const placed: WidgetLayout[] = [{ ...anchor }];
		let success = true;

		const sorted = [...others].sort((a, b) => {
			const cx = anchor.x + anchor.w / 2;
			const cy = anchor.y + anchor.h / 2;
			return Math.hypot(a.x + a.w / 2 - cx, a.y + a.h / 2 - cy) -
			       Math.hypot(b.x + b.w / 2 - cx, b.y + b.h / 2 - cy);
		});

		for (const w of sorted) {
			const { w: ww, h: wh } = w;

			if (w.locked) { placed.push({ ...w }); continue; }

			const clear = (x: number, y: number) => {
				if (x < 0 || y < 0 || x + ww > gridW || y + wh > gridH) return false;
				const t: WidgetLayout = { id: '__t__', x, y, w: ww, h: wh };
				return placed.every(p => !cornersOverlap(t, p));
			};

			// With a threshold, only displace if anchor deeply overlaps this widget;
			// still use tight cornersOverlap against already-displaced neighbours.
			const staysInPlace = (wx: number, wy: number): boolean => {
				const t: WidgetLayout = { id: '__t__', x: wx, y: wy, w: ww, h: wh };
				for (const p of placed) {
					if (displaceThreshold > 0 && p.id === anchor.id) {
						const ox = Math.min(t.x + ww, p.x + p.w) - Math.max(t.x, p.x);
						const oy = Math.min(t.y + wh, p.y + p.h) - Math.max(t.y, p.y);
						if (ox >= displaceThreshold && oy >= displaceThreshold) {
							return false;
						}
					} else if (cornersOverlap(t, p)) {
						return false;
					}
				}
				return true;
			};

			if (staysInPlace(w.x, w.y)) { placed.push({ ...w }); continue; }

			const candidates: Array<{ x: number; y: number }> = [];
			for (const p of placed) {
				const t: WidgetLayout = { id: '__t__', x: w.x, y: w.y, w: ww, h: wh };
				if (!cornersOverlap(t, p)) continue;
				candidates.push(
					{ x: snapCeil(p.x + p.w + gap),  y: w.y                    },
					{ x: snapFloor(p.x - ww - gap),  y: w.y                    },
					{ x: w.x,                         y: snapCeil(p.y + p.h + gap)  },
					{ x: w.x,                         y: snapFloor(p.y - wh - gap)  },
				);
			}

			const valid = candidates
				.filter(c => clear(c.x, c.y))
				.sort((a, b) => Math.hypot(a.x - w.x, a.y - w.y) - Math.hypot(b.x - w.x, b.y - w.y));

			if (valid.length > 0) {
				placed.push({ ...w, x: valid[0].x, y: valid[0].y });
			} else {
				const fallbackY = placed.reduce((m, p) => Math.max(m, p.y + p.h + gap), 0);
				placed.push({ ...w, y: Math.min(gridH - wh, fallbackY) });
				success = false;
			}
		}

		return { result: placed, success };
	}

	function rectsOverlap(a: WidgetLayout, b: WidgetLayout): boolean {
		return (
			a.x < b.x + b.w + gap &&
			a.x + a.w + gap > b.x &&
			a.y < b.y + b.h + gap &&
			a.y + a.h + gap > b.y
		);
	}

	// Bottom-left fill: try y rows top-to-bottom, leftmost free x per row.
	function findOrganizeSpot(w: number, h: number, placed: WidgetLayout[]): { x: number; y: number } {
		const xCandidates = new Set<number>([0]);
		const yCandidates = new Set<number>([0]);
		for (const p of placed) {
			xCandidates.add(snapCeil(p.x + p.w + gap));
			yCandidates.add(snapCeil(p.y + p.h + gap));
		}

		const xs = [...xCandidates].filter(x => x >= 0 && x + w <= gridW).sort((a, b) => a - b);
		const ys = [...yCandidates].filter(y => y >= 0).sort((a, b) => a - b);

		for (const y of ys) {
			for (const x of xs) {
				const candidate: WidgetLayout = { id: '__organize__', x, y, w, h };
				if (placed.every(p => !rectsOverlap(candidate, p))) {
					return { x, y };
				}
			}
		}

		const fallbackY = placed.reduce((max, p) => Math.max(max, p.y + p.h + gap), 0);
		return { x: 0, y: fallbackY };
	}

	// Repack all movable widgets into the smallest footprint; locked widgets stay put.
	function organize() {
		snapshot();

		const locked = layouts.filter(l => l.locked);
		const movable = layouts
			.filter(l => !l.locked)
			.sort((a, b) => (b.h - a.h) || (b.w - a.w));

		const placed: WidgetLayout[] = locked.map(l => ({ ...l }));
		for (const widget of movable) {
			const spot = findOrganizeSpot(widget.w, widget.h, placed);
			placed.push({ ...widget, x: spot.x, y: spot.y });
		}

		layouts = layouts.map(l => placed.find(p => p.id === l.id) ?? l);
	}

	function overlapsAnyLocked(x: number, y: number, w: number, h: number, skipId: string): boolean {
		const temp: WidgetLayout = { id: '__drag__', x, y, w, h };
		return layouts.some(lw => lw.locked && lw.id !== skipId && cornersOverlap(temp, lw));
	}

	function stallAgainstLocked(
		gx: number, gy: number, w: number, h: number, skipId: string,
	): { x: number; y: number; ok: boolean } {
		let x = gx;
		let y = gy;

		for (let iter = 0; iter < 20; iter++) {
			let changed = false;
			for (const lw of layouts) {
				if (!lw.locked || lw.id === skipId) continue;
				const temp: WidgetLayout = { id: '__drag__', x, y, w, h };
				if (!cornersOverlap(temp, lw)) continue;

				const pushRight = lw.x + lw.w + gap - x;
				const pushLeft  = x + w + gap - lw.x;
				const pushDown  = lw.y + lw.h + gap - y;
				const pushUp    = y + h + gap - lw.y;

				const best = ([
					{ dist: pushRight, apply: () => { x = snapCeil(lw.x + lw.w + gap); } },
					{ dist: pushLeft,  apply: () => { x = snapFloor(lw.x - w - gap); } },
					{ dist: pushDown,  apply: () => { y = snapCeil(lw.y + lw.h + gap); } },
					{ dist: pushUp,    apply: () => { y = snapFloor(lw.y - h - gap); } },
				] as const).filter(o => o.dist > 0).sort((a, b) => a.dist - b.dist)[0];

				if (best) {
					best.apply();
					x = Math.max(0, Math.min(gridW - w, x));
					y = Math.max(0, Math.min(gridH - h, y));
					changed = true;
				}
			}
			if (!changed) break;
		}

		return { x, y, ok: !overlapsAnyLocked(x, y, w, h, skipId) };
	}

	const displayLayouts = $derived.by<WidgetLayout[]>(() => {
		if (!drag && !resize) return reflowToBounds(layouts, gridW, gap);
		const anchorId = drag?.id ?? resize!.id;
		const ghostList = layouts.map(l => {
			if (drag?.id === l.id)   return { ...l, x: drag.ghostX,   y: drag.ghostY };
			if (resize?.id === l.id) return { ...l, w: resize.ghostW, h: resize.ghostH };
			return l;
		});
		// neighbour shuffles once dragged widget overlaps it by 16px in both axes
		return resolveCollisions(ghostList, anchorId, drag ? 16 : 0).result;
	});

	function toggleLock(id: string) {
		snapshot();
		layouts = layouts.map(l => l.id === id ? { ...l, locked: !l.locked } : l);
	}

	function toggleGlobalLock() {
		globalLocked = !globalLocked;
	}

	function removeWidget(id: string) {
		snapshot();
		layouts = layouts.filter(l => l.id !== id);
		if (fullscreenId === id) fullscreenId = null;
	}

	function resizeToSuggested(id: string) {
		snapshot();
		const layout = layouts.find(l => l.id === id);
		if (!layout?.suggestedW || !layout.suggestedH) return;
		const updated = layouts.map(l =>
			l.id === id ? { ...l, w: layout.suggestedW!, h: layout.suggestedH! } : l
		);
		layouts = resolveCollisions(updated, id).result;
	}

	function addWidget(type: string) {
		snapshot();
		const aw = availableWidgets.find(w => w.type === type)!;
		const newId = `${type}-${Date.now()}`;
		const newLayout: WidgetLayout = {
			id: newId,
			type,
			x: Math.max(0, Math.min(gridW - aw.defaultW, snapPx(gridMenu!.gridX))),
			y: Math.max(0, Math.min(gridH - aw.defaultH, snapPx(gridMenu!.gridY))),
			w: aw.defaultW,
			h: aw.defaultH,
			suggestedW: aw.defaultW,
			suggestedH: aw.defaultH,
		};
		layouts = resolveCollisions([...layouts, newLayout], newId).result;
		gridMenu = null;
	}

	function onGridContextMenu(e: MouseEvent) {
		if (fullscreenId || !gridEl) return;
		e.preventDefault();
		const rect = gridEl.getBoundingClientRect();
		gridMenu = {
			x: e.clientX,
			y: e.clientY,
			gridX: e.clientX - rect.left,
			gridY: e.clientY - rect.top,
		};
	}

	function startDrag(id: string, e: PointerEvent) {
		if (e.button !== 0) return;
		if (globalLocked) return;
		const layout = layouts.find(l => l.id === id)!;
		if (layout.locked) return;
		e.preventDefault();
		const wrapper = (e.currentTarget as HTMLElement).closest<HTMLElement>('[data-widget-id]');
		const rect = wrapper?.getBoundingClientRect();
		drag = {
			id,
			originX: rect ? e.clientX - rect.left : 0,
			originY: rect ? e.clientY - rect.top : 0,
			ghostX: layout.x,
			ghostY: layout.y,
		};
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
	}

	function startResize(id: string, e: PointerEvent) {
		if (e.button !== 0) return;
		if (globalLocked) return;
		const layout = layouts.find(l => l.id === id)!;
		if (layout.locked) return;
		e.preventDefault();
		e.stopPropagation();
		resize = {
			id,
			startX: e.clientX,
			startY: e.clientY,
			startW: layout.w,
			startH: layout.h,
			ghostW: layout.w,
			ghostH: layout.h,
		};
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
	}

	function onPointermove(e: PointerEvent) {
		if (drag) {
			const rect = gridEl!.getBoundingClientRect();
			const layout = layouts.find(l => l.id === drag!.id)!;

			let gx = clampX(e.clientX - rect.left - drag.originX, layout.w);
			let gy = clampY(e.clientY - rect.top  - drag.originY, layout.h);

			const stall = stallAgainstLocked(gx, gy, layout.w, layout.h, drag.id);
			if (!stall.ok) return;
			gx = stall.x;
			gy = stall.y;

			const testList = layouts.map(l => l.id === drag!.id ? { ...l, x: gx, y: gy } : l);
			const { success } = resolveCollisions(testList, drag.id);
			if (success) {
				drag.ghostX = gx;
				drag.ghostY = gy;
			}
		}

		if (resize) {
			const layout = layouts.find(l => l.id === resize!.id)!;
			const dx = e.clientX - resize.startX;
			const dy = e.clientY - resize.startY;

			let gw = Math.max(minW, Math.min(gridW - layout.x, snapPx(resize.startW + dx)));
			let gh = Math.max(minH, Math.min(gridH - layout.y, snapPx(resize.startH + dy)));

			for (const lw of layouts) {
				if (!lw.locked || lw.id === resize.id) continue;
				const temp: WidgetLayout = { id: '__resize__', x: layout.x, y: layout.y, w: gw, h: gh };
				if (!cornersOverlap(temp, lw)) continue;
				if (layout.x < lw.x) gw = Math.min(gw, snapFloor(lw.x - layout.x - gap));
				if (layout.y < lw.y) gh = Math.min(gh, snapFloor(lw.y - layout.y - gap));
			}

			const testList = layouts.map(l => l.id === resize!.id ? { ...l, w: gw, h: gh } : l);
			const { success } = resolveCollisions(testList, resize.id);
			if (success) {
				resize.ghostW = Math.max(minW, gw);
				resize.ghostH = Math.max(minH, gh);
			}
		}
	}

	function onPointerup() {
		if (drag) {
			snapshot();
			layouts = dropIntoFreeSpace(drag.id, drag.ghostX, drag.ghostY);
			drag = null;
		}
		if (resize) {
			snapshot();
			layouts = resolveCollisions(displayLayouts.map(l => ({...l})), resize.id, 0).result;
			resize = null;
		}
	}

	// On drop, slot the widget into free space if any exists instead of displacing neighbours.
	// Only when nothing is free do we fall back to pushing other widgets out of the way.
	function dropIntoFreeSpace(id: string, ghostX: number, ghostY: number): WidgetLayout[] {
		const dropped = layouts.find(l => l.id === id)!;
		const others = layouts.filter(l => l.id !== id);
		const spot = findDropSpot(
			{ x: ghostX, y: ghostY, w: dropped.w, h: dropped.h },
			others,
			gridW,
			gridH,
			gap,
			snap,
		);
		if (spot) {
			return layouts.map(l => l.id === id ? { ...l, x: spot.x, y: spot.y } : l);
		}
		const moved = layouts.map(l => l.id === id ? { ...l, x: ghostX, y: ghostY } : l);
		return resolveCollisions(moved, id, 0).result;
	}

	const addableWidgets = $derived(
		availableWidgets.filter(aw => !layouts.some(l => l.type === aw.type))
	);

	const ghost = $derived<WidgetLayout | null>(
		drag
			? { ...layouts.find(l => l.id === drag!.id)!, x: drag.ghostX, y: drag.ghostY }
			: resize
				? { ...layouts.find(l => l.id === resize!.id)!, w: resize.ghostW, h: resize.ghostH }
				: null
	);

	function handlers(layout: WidgetLayout, fs = false) {
		return {
			ondraghandlepointerdown: (e: PointerEvent) => startDrag(layout.id, e),
			onresizehandlepointerdown: (e: PointerEvent) => startResize(layout.id, e),
			locked: layout.locked ?? false,
			isFullscreen: fs,
			suggestedSize: fs || !layout.suggestedW || !layout.suggestedH
				? null
				: { w: layout.suggestedW, h: layout.suggestedH },
			globalLocked,
			ontogglelock: () => toggleLock(layout.id),
			onremove: () => removeWidget(layout.id),
			onresizetosuggested: () => resizeToSuggested(layout.id),
			onfullscreen: () => { fullscreenId = fs ? null : layout.id; },
			ontogglglobalelock: toggleGlobalLock,
		};
	}
</script>

<!-- Grid -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  bind:this={gridEl}
  use:overlayScroll
  class="relative w-full h-full overflow-y-auto overflow-x-hidden select-none"
  onpointermove={onPointermove}
  onpointerup={onPointerup}
  onpointercancel={onPointerup}
  oncontextmenu={onGridContextMenu}
>
  {#if ghost}
    <div
      class="absolute rounded-xl border-2 border-dashed border-line pointer-events-none z-10 bg-raised/20"
      style="left:{ghost.x}px; top:{ghost.y}px; width:{ghost.w}px; height:{ghost.h}px;"
    ></div>
  {/if}

  {#each layouts as layout (layout.id)}
    {@const d = displayLayouts.find(l => l.id === layout.id) ?? layout}
    {@const active = drag?.id === layout.id || resize?.id === layout.id}
    <div
      data-widget-id={layout.id}
      class="absolute"
      class:z-20={active}
      class:shadow-lg={active}
      class:opacity-90={active}
      style="left:{d.x}px; top:{d.y}px; width:{d.w}px; height:{d.h}px;{
        !active ? ' transition: left 300ms cubic-bezier(0.34,1.56,0.64,1), top 300ms cubic-bezier(0.34,1.56,0.64,1), width 250ms cubic-bezier(0.34,1.56,0.64,1), height 250ms cubic-bezier(0.34,1.56,0.64,1);' : ''
      }"
      oncontextmenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
      in:scale={{ duration: 250, start: 0.88, opacity: 0, easing: backOut }}
      out:scale={{ duration: 150, start: 0.92, opacity: 0, easing: cubicIn }}
    >
      {@render widget(layout, handlers(layout))}
    </div>
  {/each}
</div>

<!-- Fullscreen overlay -->
{#if fullscreenId}
  {@const fsLayout = layouts.find(l => l.id === fullscreenId)}
  {#if fsLayout}
    <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
    <div
      class="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-8"
      onclick={() => fullscreenId = null}
    >
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="w-full h-full max-w-7xl"
        onclick={(e) => e.stopPropagation()}
      >
        {@render widget(fsLayout, handlers(fsLayout, true))}
      </div>
    </div>
  {/if}
{/if}

<!-- Grid context menu -->
{#if gridMenu}
  <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
  <div class="fixed inset-0 z-[2000]" onclick={() => gridMenu = null}></div>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed z-[2001] min-w-[200px] rounded-lg border border-line bg-elevated shadow-lg py-1"
    style="left: {gridMenu.x}px; top: {gridMenu.y}px"
    onclick={(e) => e.stopPropagation()}
    in:menuReveal
    out:menuHide
  >
    <button
      class="w-full h-9 px-3 flex items-center gap-2.5 text-[13px] text-default hover:bg-hover cursor-pointer disabled:opacity-40 disabled:cursor-default"
      onclick={() => { undo(); gridMenu = null; }}
      disabled={!history.length}
    >
      <ArrowCounterClockwiseIcon size={14} class="text-dim shrink-0" />
      Undo
    </button>
    <button
      class="w-full h-9 px-3 flex items-center gap-2.5 text-[13px] text-default hover:bg-hover cursor-pointer disabled:opacity-40 disabled:cursor-default"
      onclick={() => { redo(); gridMenu = null; }}
      disabled={!future.length}
    >
      <ArrowClockwiseIcon size={14} class="text-dim shrink-0" />
      Redo
    </button>

    <div class="h-px bg-line mx-2 my-1"></div>

    <!-- svelte-ignore a11y_role_supports_aria_props -->
    <button
      class="w-full h-9 px-3 flex items-center gap-2.5 text-[13px] text-default hover:bg-hover cursor-pointer"
      onclick={() => { organize(); gridMenu = null; }}
    >
      <SquaresFourIcon size={14} class="text-dim shrink-0" />
      Organize
    </button>

    <div class="h-px bg-line mx-2 my-1"></div>

    {#if addableWidgets.length > 0}
      <div class="px-3 py-1.5 text-[11px] font-medium text-dim uppercase tracking-widest">
        Add widget
      </div>
      {#each addableWidgets as aw}
        <!-- svelte-ignore a11y_role_supports_aria_props -->
        <button
          class="w-full h-9 px-3 flex items-center gap-2.5 text-[13px] text-default hover:bg-hover cursor-pointer"
          onclick={() => addWidget(aw.type)}
        >
          <PlusIcon size={14} class="text-dim shrink-0" />
          {aw.label}
        </button>
      {/each}
      <div class="h-px bg-line mx-2 my-1"></div>
    {/if}

    <!-- svelte-ignore a11y_role_supports_aria_props -->
    <button
      class="w-full h-9 px-3 flex items-center gap-2.5 text-[13px] text-default hover:bg-hover cursor-pointer"
      onclick={() => { toggleGlobalLock(); gridMenu = null; }}
    >
      {#if globalLocked}
        <LockKeyOpenIcon size={14} class="text-dim shrink-0" />
        Unfreeze layout
      {:else}
        <LockKeyIcon size={14} class="text-dim shrink-0" />
        Freeze layout
      {/if}
    </button>
  </div>
{/if}

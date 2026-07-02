export interface BoundsWidget {
	id: string;
	x: number;
	y: number;
	w: number;
	h: number;
	locked?: boolean;
}

export interface Rect {
	x: number;
	y: number;
	w: number;
	h: number;
}

/**
 * Reflow a layout into the given width for display only, optimizing for space usage.
 *
 * While the whole layout fits the width, it is left untouched (freeform pegboard). Once it
 * overflows, unlocked widgets are packed into rows in reading order — as many side by side as
 * fit — and every row is stretched to fill the full width, so space is used well and widgets
 * never end up needlessly tiny. Locked widgets keep their exact size/position and the packed
 * rows flow below them. Height is never constrained, so the grid scrolls vertically.
 *
 * Display-only: the stored layout is never mutated, so growing the width back restores every
 * widget exactly (the same array reference is returned when nothing needs changing).
 */
export function reflowToBounds<T extends BoundsWidget>(list: T[], gridW: number, gap = 8): T[] {
	if (!gridW || list.length === 0) return list;

	let contentW = 0;
	for (const widget of list) contentW = Math.max(contentW, widget.x + widget.w);
	if (contentW <= gridW) return list; // fits — keep the freeform layout

	const order = [...list].sort((a, b) => a.y - b.y || a.x - b.x);
	const placed: T[] = [];

	// Locked widgets stay put; packed rows start below the lowest one.
	let rowTop = 0;
	for (const widget of order) {
		if (!widget.locked) continue;
		placed.push({ ...widget });
		rowTop = Math.max(rowTop, widget.y + widget.h + gap);
	}

	const movable = order.filter((w) => !w.locked);
	const rows = packRows(movable, gridW, gap);

	let y = rowTop;
	for (const row of rows) {
		const totalGap = gap * (row.length - 1);
		const totalNatural = row.reduce((sum, w) => sum + Math.min(w.w, gridW), 0);
		const scale = (gridW - totalGap) / totalNatural;

		let x = 0;
		let rowHeight = 0;
		row.forEach((widget, i) => {
			const isLast = i === row.length - 1;
			const w = isLast ? gridW - x : Math.round(Math.min(widget.w, gridW) * scale);
			placed.push({ ...widget, x, y, w });
			x += w + gap;
			rowHeight = Math.max(rowHeight, widget.h);
		});
		y += rowHeight + gap;
	}

	return list.map((l) => placed.find((p) => p.id === l.id)!);
}

// Greedily group widgets into rows that fit the width at their natural sizes (reading order).
function packRows<T extends BoundsWidget>(widgets: T[], gridW: number, gap: number): T[][] {
	const rows: T[][] = [];
	let row: T[] = [];
	let rowWidth = 0;

	for (const widget of widgets) {
		const naturalWidth = Math.min(widget.w, gridW);
		if (row.length === 0) {
			row = [widget];
			rowWidth = naturalWidth;
		} else if (rowWidth + gap + naturalWidth <= gridW) {
			row.push(widget);
			rowWidth += gap + naturalWidth;
		} else {
			rows.push(row);
			row = [widget];
			rowWidth = naturalWidth;
		}
	}
	if (row.length > 0) rows.push(row);

	return rows;
}

function rectsOverlap(a: Rect, b: Rect, gap: number): boolean {
	return (
		a.x < b.x + b.w + gap &&
		a.x + a.w + gap > b.x &&
		a.y < b.y + b.h + gap &&
		a.y + a.h + gap > b.y
	);
}

function fitsInBounds(rect: Rect, gridW: number, gridH: number): boolean {
	return rect.x >= 0 && rect.y >= 0 && rect.x + rect.w <= gridW && rect.y + rect.h <= gridH;
}

function isFree(rect: Rect, others: Rect[], gridW: number, gridH: number, gap: number): boolean {
	if (!fitsInBounds(rect, gridW, gridH)) return false;
	return others.every((other) => !rectsOverlap(rect, other, gap));
}

/**
 * Find where a dropped widget should land.
 *
 * Prefers the desired position when it is free, otherwise the nearest free spot seeded from
 * the neighbours' edges — so a drop slots into empty space instead of shoving other widgets
 * aside. Returns `null` only when there is no free space at all (caller should then fall back
 * to displacing neighbours).
 */
export function findDropSpot(
	dropped: Rect,
	others: Rect[],
	gridW: number,
	gridH: number,
	gap: number,
	snap: number,
): { x: number; y: number } | null {
	if (isFree(dropped, others, gridW, gridH, gap)) {
		return { x: dropped.x, y: dropped.y };
	}

	const snapCeil = (px: number) => Math.ceil(px / snap) * snap;
	const snapFloor = (px: number) => Math.floor(px / snap) * snap;
	const { w, h } = dropped;

	const candidates: Array<{ x: number; y: number }> = [];
	for (const other of others) {
		candidates.push(
			{ x: snapCeil(other.x + other.w + gap), y: dropped.y },
			{ x: snapFloor(other.x - w - gap), y: dropped.y },
			{ x: dropped.x, y: snapCeil(other.y + other.h + gap) },
			{ x: dropped.x, y: snapFloor(other.y - h - gap) },
		);
	}
	candidates.push({ x: 0, y: dropped.y }, { x: dropped.x, y: 0 }, { x: 0, y: 0 });

	const valid = candidates
		.filter((c) => isFree({ x: c.x, y: c.y, w, h }, others, gridW, gridH, gap))
		.sort(
			(a, b) =>
				Math.hypot(a.x - dropped.x, a.y - dropped.y) -
				Math.hypot(b.x - dropped.x, b.y - dropped.y),
		);

	return valid[0] ?? null;
}

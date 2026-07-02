import { expect, test } from 'bun:test';
import { reflowToBounds, findDropSpot, type BoundsWidget, type Rect } from '../src/lib/widgetGrid';

const widget = (over: Partial<BoundsWidget> = {}): BoundsWidget => ({
	id: 'a',
	x: 0,
	y: 0,
	w: 100,
	h: 100,
	...over,
});

// ── reflowToBounds (width-only; vertical overflow is allowed to scroll) ──

test('returns the same array reference when everything already fits the width', () => {
	const list = [widget({ x: 10, y: 10 }), widget({ id: 'b', x: 200, y: 0 })];
	expect(reflowToBounds(list, 800, 8)).toBe(list);
});

test('returns the input unchanged when the width is not measured yet', () => {
	const list = [widget({ x: 9999, y: 9999 })];
	expect(reflowToBounds(list, 0, 8)).toBe(list);
});

test('expands unlocked widgets to the full width and stacks them when the layout overflows', () => {
	// two 400-wide widgets side by side; grid only 500 wide -> both fill width, stacked
	const list = [
		widget({ id: 'a', x: 0, y: 0, w: 400, h: 200 }),
		widget({ id: 'b', x: 408, y: 0, w: 400, h: 200 }),
	];
	const out = reflowToBounds(list, 500, 8);
	const a = out.find((w) => w.id === 'a')!;
	const b = out.find((w) => w.id === 'b')!;
	expect(a).toMatchObject({ x: 0, y: 0, w: 500 }); // fills width
	expect(b.w).toBe(500); // fills width too
	expect(b.y).toBeGreaterThanOrEqual(a.y + a.h); // stacked below a
	expect(a.h).toBe(200); // height kept
});

test('packs widgets side by side and fills the row when they fit together', () => {
	// two 200-wide widgets, but the layout overflows (b sits far right) -> reflow into one row
	const list = [
		widget({ id: 'a', x: 0, y: 0, w: 200, h: 200 }),
		widget({ id: 'b', x: 600, y: 0, w: 200, h: 200 }),
	];
	const out = reflowToBounds(list, 500, 8);
	const a = out.find((w) => w.id === 'a')!;
	const b = out.find((w) => w.id === 'b')!;
	expect(a.y).toBe(b.y); // same row
	expect(a.x).toBe(0);
	expect(b.x).toBeGreaterThan(0); // beside a, not stacked
	expect(a.w + b.w + 8).toBe(500); // row fills the full width
});

test('leaves widgets that still fit exactly where they are', () => {
	const list = [
		widget({ id: 'a', x: 0, y: 0, w: 200, h: 200 }),
		widget({ id: 'b', x: 300, y: 0, w: 200, h: 200 }),
	];
	expect(reflowToBounds(list, 600, 8)).toBe(list);
});

test('does not constrain height — a tall widget keeps its height and may overflow downward', () => {
	const list = [widget({ id: 'a', x: 0, y: 0, w: 200, h: 5000 })];
	expect(reflowToBounds(list, 600, 8)).toBe(list);
});

test('does not mutate the original list and restores exactly when the width grows back', () => {
	const original = widget({ id: 'b', x: 408, y: 0, w: 400, h: 200 });
	const list = [widget({ id: 'a', x: 0, y: 0, w: 400, h: 200 }), original];
	reflowToBounds(list, 500, 8);
	expect(original.x).toBe(408);
	expect(original.w).toBe(400);
	// once the grid is wide enough again, the same reference comes back unchanged
	expect(reflowToBounds(list, 1000, 8)).toBe(list);
});

test('anchors locked widgets and flows movable ones around them', () => {
	const list = [
		widget({ id: 'locked', x: 0, y: 0, w: 400, h: 200, locked: true }),
		widget({ id: 'move', x: 408, y: 0, w: 400, h: 200 }),
	];
	const out = reflowToBounds(list, 500, 8);
	expect(out.find((w) => w.id === 'locked')).toMatchObject({ x: 0, y: 0 });
	expect(out.find((w) => w.id === 'move')!.y).toBeGreaterThanOrEqual(200);
});

// ── findDropSpot ───────────────────────────────────────────────

const rect = (over: Partial<Rect> = {}): Rect => ({ x: 0, y: 0, w: 100, h: 100, ...over });

test('keeps the desired position when it is already free', () => {
	const spot = findDropSpot(rect({ x: 200, y: 200 }), [rect({ x: 0, y: 0 })], 800, 600, 8, 8);
	expect(spot).toEqual({ x: 200, y: 200 });
});

test('relocates the dropped widget to nearby free space instead of displacing a neighbour', () => {
	const others = [rect({ x: 200, y: 200 })];
	const spot = findDropSpot(rect({ x: 210, y: 210 }), others, 800, 600, 8, 8);
	expect(spot).not.toBeNull();
	const s = spot!;
	const overlaps =
		s.x < 200 + 100 + 8 && s.x + 100 + 8 > 200 && s.y < 200 + 100 + 8 && s.y + 100 + 8 > 200;
	expect(overlaps).toBe(false);
});

test('returns null when the grid is completely full', () => {
	const spot = findDropSpot(rect({ x: 0, y: 0 }), [rect({ x: 0, y: 0 })], 100, 100, 8, 8);
	expect(spot).toBeNull();
});

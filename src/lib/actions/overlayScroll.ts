/**
 * Overlay scrollbar action.
 *
 * Hides the native scrollbar (so it never reserves layout space) and renders a thin themed
 * thumb that floats over the content. The thumb is hidden by default and revealed while the
 * container is hovered or scrolling, and can be dragged to scroll. Apply with `use:overlayScroll`
 * on any scroll container (the element must be `position: relative`).
 */
export function overlayScroll(node: HTMLElement) {
	node.classList.add('ov-scroll');

	const thumb = document.createElement('div');
	thumb.className = 'ov-scroll__thumb';
	node.appendChild(thumb);

	let hideTimer: ReturnType<typeof setTimeout> | undefined;
	let dragging = false;
	let dragStartY = 0;
	let dragStartScroll = 0;

	const MIN_THUMB = 28;

	function scrollable(): boolean {
		return node.scrollHeight > node.clientHeight + 1;
	}

	function thumbHeight(): number {
		return Math.max(MIN_THUMB, (node.clientHeight / node.scrollHeight) * node.clientHeight);
	}

	function update() {
		if (!scrollable()) {
			thumb.style.opacity = '0';
			thumb.style.pointerEvents = 'none';
			return;
		}
		thumb.style.pointerEvents = 'auto';

		const h = thumbHeight();
		const maxTop = node.clientHeight - h;
		const ratio = node.scrollTop / (node.scrollHeight - node.clientHeight);
		// Offset by scrollTop so the thumb stays pinned to the viewport instead of scrolling away.
		thumb.style.height = `${h}px`;
		thumb.style.transform = `translateY(${node.scrollTop + ratio * maxTop}px)`;
	}

	function show() {
		update();
		if (!scrollable()) return;
		thumb.style.opacity = '1';
		clearTimeout(hideTimer);
	}

	function scheduleHide() {
		clearTimeout(hideTimer);
		hideTimer = setTimeout(() => {
			if (!dragging) thumb.style.opacity = '0';
		}, 900);
	}

	function onScroll() {
		show();
		scheduleHide();
	}

	function onThumbDown(e: PointerEvent) {
		e.preventDefault();
		e.stopPropagation();
		dragging = true;
		dragStartY = e.clientY;
		dragStartScroll = node.scrollTop;
		thumb.setPointerCapture(e.pointerId);
	}

	function onThumbMove(e: PointerEvent) {
		if (!dragging) return;
		const maxTop = node.clientHeight - thumbHeight();
		const scrollRange = node.scrollHeight - node.clientHeight;
		node.scrollTop = dragStartScroll + ((e.clientY - dragStartY) / maxTop) * scrollRange;
	}

	function onThumbUp(e: PointerEvent) {
		dragging = false;
		try {
			thumb.releasePointerCapture(e.pointerId);
		} catch {}
		scheduleHide();
	}

	node.addEventListener('scroll', onScroll, { passive: true });
	node.addEventListener('pointerenter', show);
	node.addEventListener('pointerleave', scheduleHide);
	thumb.addEventListener('pointerdown', onThumbDown);
	thumb.addEventListener('pointermove', onThumbMove);
	thumb.addEventListener('pointerup', onThumbUp);

	const ro = new ResizeObserver(update);
	ro.observe(node);
	const mo = new MutationObserver(update);
	mo.observe(node, { childList: true, subtree: true, characterData: true });

	update();

	return {
		destroy() {
			clearTimeout(hideTimer);
			ro.disconnect();
			mo.disconnect();
			node.removeEventListener('scroll', onScroll);
			node.removeEventListener('pointerenter', show);
			node.removeEventListener('pointerleave', scheduleHide);
			thumb.remove();
			node.classList.remove('ov-scroll');
		},
	};
}

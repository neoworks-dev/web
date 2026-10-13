let topLayer = 10;

/**
 * Lets the pointer drag `node` around by setting its CSS `translate`, which composes
 * with any `rotate` or animated `transform` already on the element. The dragged
 * element is raised above everything dragged before it.
 */
export function draggable(node: HTMLElement) {
	let startPointerX = 0;
	let startPointerY = 0;
	let offsetX = 0;
	let offsetY = 0;
	let startOffsetX = 0;
	let startOffsetY = 0;

	function handlePointerDown(event: PointerEvent) {
		if (event.button !== 0) return;
		event.preventDefault();
		node.setPointerCapture(event.pointerId);
		startPointerX = event.clientX;
		startPointerY = event.clientY;
		startOffsetX = offsetX;
		startOffsetY = offsetY;
		topLayer += 1;
		node.style.zIndex = String(topLayer);
		node.style.cursor = 'grabbing';
		node.addEventListener('pointermove', handlePointerMove);
	}

	function handlePointerMove(event: PointerEvent) {
		offsetX = startOffsetX + event.clientX - startPointerX;
		offsetY = startOffsetY + event.clientY - startPointerY;
		node.style.translate = `${offsetX}px ${offsetY}px`;
	}

	function handlePointerUp(event: PointerEvent) {
		if (!node.hasPointerCapture(event.pointerId)) return;
		node.releasePointerCapture(event.pointerId);
		node.style.cursor = '';
		node.removeEventListener('pointermove', handlePointerMove);
	}

	node.style.touchAction = 'none';
	node.addEventListener('pointerdown', handlePointerDown);
	node.addEventListener('pointerup', handlePointerUp);
	node.addEventListener('pointercancel', handlePointerUp);

	return {
		destroy() {
			node.removeEventListener('pointerdown', handlePointerDown);
			node.removeEventListener('pointerup', handlePointerUp);
			node.removeEventListener('pointercancel', handlePointerUp);
			node.removeEventListener('pointermove', handlePointerMove);
		}
	};
}

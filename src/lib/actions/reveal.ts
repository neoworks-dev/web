const REVEAL_DISTANCE_PX = 24;
const REVEAL_DURATION_MS = 800;
const REVEAL_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

type RevealOptions = { delay?: number };

export function prefersReducedMotion(): boolean {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Calls `onVisible` once, when `node` has scrolled a little way into the viewport. */
export function whenFirstVisible(node: Element, onVisible: () => void): () => void {
	const observer = new IntersectionObserver(
		(entries) => {
			if (!entries.some((entry) => entry.isIntersecting)) return;
			observer.disconnect();
			onVisible();
		},
		{ rootMargin: '0px 0px -12% 0px' }
	);
	observer.observe(node);
	return () => observer.disconnect();
}

/**
 * Fades and lifts `node` into place the first time it scrolls into view. The inline
 * styles are removed afterwards so they cannot override the element's own transitions.
 */
export function reveal(node: HTMLElement, { delay = 0 }: RevealOptions = {}) {
	if (prefersReducedMotion()) return;

	let cleanupTimer: ReturnType<typeof setTimeout> | undefined;
	node.style.opacity = '0';
	node.style.transform = `translateY(${REVEAL_DISTANCE_PX}px)`;

	const stopObserving = whenFirstVisible(node, () => {
		node.style.transition = `opacity ${REVEAL_DURATION_MS}ms ${REVEAL_EASING} ${delay}ms, transform ${REVEAL_DURATION_MS}ms ${REVEAL_EASING} ${delay}ms`;
		node.style.opacity = '';
		node.style.transform = '';
		cleanupTimer = setTimeout(() => node.style.removeProperty('transition'), delay + REVEAL_DURATION_MS);
	});

	return {
		destroy() {
			stopObserving();
			clearTimeout(cleanupTimer);
		}
	};
}

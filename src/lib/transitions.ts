import { cubicOut, cubicIn } from 'svelte/easing';

export function menuReveal(_node: Element, { duration = 120, easing = cubicOut } = {}) {
	return {
		duration,
		easing,
		css: (t: number) =>
			`transform: scale(${0.7 + 0.3 * t}); transform-origin: top left; opacity: ${t};`,
	};
}

export function menuHide(_node: Element, { duration = 90, easing = cubicIn } = {}) {
	return {
		duration,
		easing,
		css: (t: number) =>
			`transform: scale(${0.7 + 0.3 * t}); transform-origin: top left; opacity: ${t};`,
	};
}

/** A paper card swinging down from the tape it hangs on. Instant with reduced motion. */
export function paperSwing(_node: Element, { duration = 260, easing = cubicOut } = {}) {
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		return { duration: 0 };
	}
	return {
		duration,
		easing,
		css: (t: number) =>
			`transform: perspective(900px) rotateX(${(1 - t) * -35}deg) translateY(${(1 - t) * -8}px); transform-origin: top center; opacity: ${t};`,
	};
}

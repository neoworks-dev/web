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

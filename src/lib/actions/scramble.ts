import { prefersReducedMotion, whenFirstVisible } from './reveal';

const SCRAMBLE_DURATION_MS = 1100;
const HEX_DIGITS = '0123456789abcdef';

type ScrambleOptions = { delay?: number };

function randomHex(length: number): string {
	let text = '';
	for (let index = 0; index < length; index++) {
		text += HEX_DIGITS[Math.floor(Math.random() * HEX_DIGITS.length)];
	}
	return text;
}

/**
 * When `node` first scrolls into view, its text churns through random hex digits
 * and settles on its real content one character at a time, left to right.
 */
export function scramble(node: HTMLElement, { delay = 0 }: ScrambleOptions = {}) {
	if (prefersReducedMotion()) return;

	const finalText = node.innerText;
	let animationFrame = 0;

	function renderFrame(startTime: number, now: number) {
		const progress = Math.min(1, Math.max(0, (now - startTime) / SCRAMBLE_DURATION_MS));
		const settledLength = Math.floor(progress * finalText.length);
		node.textContent = finalText.slice(0, settledLength) + randomHex(finalText.length - settledLength);
		if (progress < 1) {
			animationFrame = requestAnimationFrame((nextNow) => renderFrame(startTime, nextNow));
		}
	}

	const stopObserving = whenFirstVisible(node, () => {
		const startTime = performance.now() + delay;
		animationFrame = requestAnimationFrame((now) => renderFrame(startTime, now));
	});

	return {
		destroy() {
			stopObserving();
			cancelAnimationFrame(animationFrame);
		}
	};
}

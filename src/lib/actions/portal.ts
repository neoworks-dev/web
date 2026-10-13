/**
 * Moves `node` to the end of <body>, out of any stacking context its parents create,
 * such as a sticky sidebar. Svelte still owns the node and removes it on destroy.
 */
export function portal(node: HTMLElement) {
	document.body.appendChild(node);
	return {
		destroy() {
			node.remove();
		}
	};
}

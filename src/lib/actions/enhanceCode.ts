import { mount, unmount } from 'svelte';
import CodeBlock from '$lib/components/docs/CodeBlock.svelte';

/**
 * Swaps the plain `<pre data-language>` blocks that markdown produces for CodeBlock,
 * so fenced code gets the same header and copy button as the components.
 */
export function enhanceCode(article: HTMLElement) {
	const mounted: ReturnType<typeof mount>[] = [];

	for (const block of article.querySelectorAll<HTMLPreElement>('pre[data-language]')) {
		const code = block.textContent ?? '';
		const language = block.dataset.language ?? '';
		const target = document.createElement('div');
		block.replaceWith(target);
		mounted.push(mount(CodeBlock, { target, props: { code, language } }));
	}

	return {
		destroy() {
			for (const component of mounted) unmount(component);
		}
	};
}

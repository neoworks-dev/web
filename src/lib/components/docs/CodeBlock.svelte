<script lang="ts">
	import { highlightCode } from '$lib/docs/highlight';
	import CopyButton from './CopyButton.svelte';

	let {
		code,
		language = '',
		filename = '',
		class: className = ''
	}: { code: string; language?: string; filename?: string; class?: string } = $props();

	const label = $derived.by(() => {
		if (filename !== '') return filename;
		return language;
	});
	const trimmedCode = $derived(code.replace(/\n$/, ''));
</script>

<figure class={['code-panel not-prose my-6 overflow-hidden', className]}>
	<figcaption class="flex items-center justify-between border-b border-white/10 py-1 pl-4 pr-2">
		<span class="font-mono text-xs text-[#a3a3a8]">{label}</span>
		<CopyButton text={trimmedCode} />
	</figcaption>
	<pre class="overflow-x-auto px-4 py-3.5 text-[0.8125rem] leading-relaxed"><code
			>{@html highlightCode(trimmedCode, language)}</code
		></pre>
</figure>

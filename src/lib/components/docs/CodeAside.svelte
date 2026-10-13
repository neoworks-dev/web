<script lang="ts">
	import type { ComponentProps, Snippet } from 'svelte';
	import CodeBlock from './CodeBlock.svelte';
	import MarginAside from './MarginAside.svelte';

	let {
		children,
		...code
	}: { children?: Snippet } & Omit<ComponentProps<typeof CodeBlock>, 'class'> = $props();
</script>

<!-- A section of the page and the code it explains, in the right margin. -->
<MarginAside {children}>
	{#snippet aside()}
		<CodeBlock {...code} class="my-8 xl:mt-0" />
	{/snippet}
</MarginAside>

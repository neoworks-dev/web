<script lang="ts">
	import type { ComponentProps, Snippet } from 'svelte';
	import MarginAside from './MarginAside.svelte';
	import RequestExample from './RequestExample.svelte';

	let {
		children,
		...example
	}: { children?: Snippet } & Omit<ComponentProps<typeof RequestExample>, 'class'> = $props();
</script>

<!-- A section of the page and the request that shows it off, in the right margin. -->
<MarginAside {children}>
	{#snippet aside()}
		<RequestExample {...example} class="my-8 xl:mt-0" />
	{/snippet}
</MarginAside>

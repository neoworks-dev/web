<script lang="ts">
	import type { Snippet } from 'svelte';
	import FloatingHeader from '$lib/components/FloatingHeader.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import type { LayoutData } from './$types';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();
</script>

<div id="top" class="flex min-h-screen flex-col bg-canvas text-primary antialiased">
	<FloatingHeader user={data.user} />

	<main class="flex-1">
		{@render children()}
	</main>

	<Footer />
</div>

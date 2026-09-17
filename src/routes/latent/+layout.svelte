<script lang="ts">
	import LatentNav from '$lib/components/latent/LatentNav.svelte';
	import LatentFooter from '$lib/components/latent/LatentFooter.svelte';

	let { children } = $props();
</script>

<div id="top" class="flex min-h-screen flex-col bg-canvas text-primary antialiased">
	<LatentNav />

	<main class="flex-1">
		{@render children()}
	</main>

	<LatentFooter />
</div>

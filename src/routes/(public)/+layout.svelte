<script lang="ts">
	import '@fontsource-variable/geist';
	import '@fontsource-variable/geist-mono';
	import '@fontsource/caveat/500.css';
	import FloatingHeader from '$lib/components/FloatingHeader.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { page } from '$app/state';
	import { isAlwaysLight } from '$lib/theme';

	let { children, data } = $props();

	function themeForPath(pathname: string): 'light' | undefined {
		if (isAlwaysLight(pathname)) return 'light';
		return undefined;
	}
</script>

<div
	data-scene-root
	data-theme={themeForPath(page.url.pathname)}
	class="flex min-h-screen flex-col bg-canvas text-primary antialiased"
>
	<FloatingHeader user={data.user} />

	<a
		href="#main-content"
		class="sr-only fixed left-4 top-4 z-toast rounded-md border border-line-strong bg-canvas px-4 py-2 text-2xs uppercase tracking-widest text-default shadow-lg focus:not-sr-only focus:outline-none [font-family:var(--font-mono)]"
	>
		Skip to content
	</a>

	<main id="main-content" class="flex-1 focus:outline-none" tabindex="-1">
		{@render children()}
	</main>

	<Footer />
</div>

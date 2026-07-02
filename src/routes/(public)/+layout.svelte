<script lang="ts">
	import { onMount } from 'svelte';
	import FloatingHeader from '$lib/components/FloatingHeader.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { sdk } from '$lib/sdk';

	let { children, data } = $props();

	// "Sign in with NeoWorks" One Tap: offer a frictionless sign-in to logged-out
	// visitors who already have a NeoWorks SSO session. Accept routes through the
	// app's own server-side PKCE login so the callback's verifier cookie matches.
	onMount(() => {
		if (data.user) return;
		sdk.signIn.promptSignIn({
			onAccept: () => {
				window.location.href = '/auth/login';
			}
		});
	});
</script>

<div class="flex min-h-screen flex-col bg-canvas text-primary antialiased">
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

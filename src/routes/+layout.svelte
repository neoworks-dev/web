<script lang="ts">
	import './neoworks.css';
	import { page } from '$app/stores';
	import { onNavigate } from '$app/navigation';
	import { resolveMeta } from '$lib/meta';

	let { children } = $props();

	const meta = $derived(resolveMeta($page.data.meta));

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

</script>

<svelte:head>
  <title>{meta.title}</title>
  <meta name="description" content={meta.description} />

  <meta property="og:type" content="website" />
  <meta property="og:url" content={$page.url.href} />
  <meta property="og:title" content={meta.title} />
  <meta property="og:description" content={meta.description} />
  <meta property="og:image" content={meta.ogImage} />

  <meta name="twitter:card" content={meta.twitterCard} />
  <meta name="twitter:site" content={meta.twitterSite} />
  <meta name="twitter:title" content={meta.title} />
  <meta name="twitter:description" content={meta.description} />
  <meta name="twitter:image" content={meta.ogImage} />

  <link rel="canonical" href={$page.url.href} />
  <meta name="theme-color" content={meta.themeColor} />
  <link rel="icon" href={meta.icon} type="image/svg+xml" />
</svelte:head>

{@render children()}

<style>
	@keyframes fade-slide-in {
		from { opacity: 0; transform: translateY(6px); }
		to   { opacity: 1; transform: translateY(0);   }
	}
	@keyframes fade-slide-out {
		from { opacity: 1; transform: translateY(0);    }
		to   { opacity: 0; transform: translateY(-6px); }
	}

	:global(::view-transition-old(root)) {
		animation: 160ms ease-in  both fade-slide-out;
	}
	:global(::view-transition-new(root)) {
		animation: 220ms ease-out both fade-slide-in;
	}
</style>

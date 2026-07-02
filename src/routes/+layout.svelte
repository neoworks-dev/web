<script lang="ts">
	import './neoworks.css';
	import { page } from '$app/stores';
	import { onNavigate } from '$app/navigation';

	let { children } = $props();

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	const defaultMeta = {
		title:       'NeoWorks — Your data, your rules',
		description: 'A personal cloud built on ownership, not surveillance. One identity.',
		ogImage:     '/og-default.png',
		twitterCard: 'summary_large_image',
	};
</script>

<svelte:head>
  <title>{defaultMeta.title}</title>
  <meta name="description" content={defaultMeta.description} />

  <meta property="og:type" content="website" />
  <meta property="og:url" content={$page.url.href} />
  <meta property="og:title" content={defaultMeta.title} />
  <meta property="og:description" content={defaultMeta.description} />
  <meta property="og:image" content={defaultMeta.ogImage} />

  <meta name="twitter:card" content={defaultMeta.twitterCard} />
  <meta name="twitter:site" content="@neoworks" />
  <meta name="twitter:title" content={defaultMeta.title} />
  <meta name="twitter:description" content={defaultMeta.description} />
  <meta name="twitter:image" content={defaultMeta.ogImage} />

  <link rel="canonical" href={$page.url.href} />
  <meta name="theme-color" content="#040906" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
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

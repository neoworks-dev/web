<script lang="ts">
	import { page } from '$app/stores';
	import GithubLogoIcon from 'phosphor-svelte/lib/GithubLogoIcon';
	import { latent, latentFeatures, latentHref } from '$lib/latent';

	const hostname = $derived($page.url.hostname);

	function isCurrent(path: string) {
		return $page.route.id === `/latent${path}`;
	}

	function ariaCurrent(path: string) {
		if (isCurrent(path)) return 'page';
		return undefined;
	}
</script>

<!-- Sub-nav row attached under the main header, mirroring the docs product tabs. -->
<nav class="flex items-center gap-1 px-3">
	<a
		href={latentHref(hostname, '')}
		class="shrink-0 px-2.5 py-2 text-sm font-semibold tracking-tight text-default"
	>
		Latent
	</a>

	{#each latentFeatures as feature}
		<a
			href={latentHref(hostname, feature.path)}
			aria-current={ariaCurrent(feature.path)}
			class="shrink-0 rounded-full px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-hover hover:text-default"
			class:text-default={isCurrent(feature.path)}
			class:bg-hover={isCurrent(feature.path)}
			class:text-muted={!isCurrent(feature.path)}
		>
			{feature.label}
		</a>
	{/each}

	<a
		href="/docs/latent"
		class="shrink-0 rounded-full px-2.5 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-hover hover:text-default"
	>
		Docs
	</a>

	<a
		href={latent.sourceUrl}
		aria-label="Latent on GitHub"
		class="ml-auto flex size-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-hover hover:text-default"
	>
		<GithubLogoIcon size={16} weight="fill" />
	</a>
</nav>

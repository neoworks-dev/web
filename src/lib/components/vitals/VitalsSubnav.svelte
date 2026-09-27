<script lang="ts">
	import { page } from '$app/stores';
	import GithubLogoIcon from 'phosphor-svelte/lib/GithubLogoIcon';
	import { vitals, vitalsHref, vitalsSections } from '$lib/vitals';

	const homeHref = $derived(vitalsHref($page.url.hostname));
</script>

<!-- Sub-nav row attached under the main header, mirroring the Latent product tabs.
     The landing page is one document, so these are section anchors, not routes. -->
<nav class="flex items-center gap-1 overflow-x-auto px-3">
	<a
		href={homeHref}
		class="shrink-0 px-2.5 py-2 text-sm font-semibold tracking-tight text-default"
	>
		Vitals
	</a>

	{#each vitalsSections as section}
		<a
			href={section.hash}
			class="shrink-0 rounded-full px-2.5 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-hover hover:text-default"
		>
			{section.label}
		</a>
	{/each}

	<a
		href={vitals.sourceUrl}
		aria-label="vitals on GitHub"
		class="ml-auto flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-hover hover:text-default"
	>
		<GithubLogoIcon size={16} weight="fill" />
	</a>
</nav>

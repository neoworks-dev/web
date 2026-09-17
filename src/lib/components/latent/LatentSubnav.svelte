<script lang="ts">
	import GithubLogoIcon from 'phosphor-svelte/lib/GithubLogoIcon';
	import { latent } from '$lib/latent';

	// Anchors, so they resolve on latent.<base-domain> and on /latent alike.
	const sectionLinks = [
		{ label: 'Develop', href: '#develop' },
		{ label: 'Masks', href: '#masks' },
		{ label: 'Library', href: '#library' }
	];
</script>

<!-- Sub-nav row attached under the main header, mirroring the docs product tabs. -->
<nav class="flex items-center gap-1 px-3">
	<span class="shrink-0 px-2.5 py-2 text-sm font-semibold tracking-tight text-default">Latent</span>

	{#each sectionLinks as { label, href }}
		<a
			{href}
			class="shrink-0 rounded-full px-2.5 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-hover hover:text-default"
		>
			{label}
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

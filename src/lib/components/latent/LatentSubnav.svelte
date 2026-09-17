<script lang="ts">
	import DownloadSimpleIcon from 'phosphor-svelte/lib/DownloadSimpleIcon';
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

	<div class="ml-auto flex items-center gap-1.5">
		<a
			href={latent.sourceUrl}
			aria-label="Latent on GitHub"
			class="flex size-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-hover hover:text-default"
		>
			<GithubLogoIcon size={16} weight="fill" />
		</a>
		<a
			href={latent.appImageUrl}
			class="flex items-center gap-1.5 rounded-full bg-action px-3 py-1.5 text-sm font-semibold text-action-fg transition-opacity hover:opacity-90 active:scale-[0.98]"
		>
			<DownloadSimpleIcon size={14} weight="bold" />
			AppImage
		</a>
	</div>
</nav>

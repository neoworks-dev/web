<script lang="ts">
	import GithubLogoIcon from 'phosphor-svelte/lib/GithubLogoIcon';
	import DownloadButton from './DownloadButton.svelte';
	import { latent } from '$lib/latent';

	const sectionLinks = [
		{ label: 'Develop', href: '#develop' },
		{ label: 'Masks', href: '#masks' },
		{ label: 'Library', href: '#library' }
	];
</script>

<header class="sticky top-0 z-50 border-b border-line-faint bg-canvas/80 backdrop-blur-xl">
	<nav class="mx-auto flex h-16 max-w-[1240px] items-center gap-8 px-6">
		<a href="#top" class="text-base font-semibold tracking-tight text-default">latent</a>

		<div class="flex items-center gap-6 max-md:hidden">
			{#each sectionLinks as { label, href }}
				<a {href} class="text-sm text-muted transition-colors hover:text-default">{label}</a>
			{/each}
		</div>

		<div class="ml-auto flex items-center gap-3">
			<a
				href={latent.sourceUrl}
				aria-label="Latent on GitHub"
				class="flex size-9 items-center justify-center rounded-full border border-line-faint text-muted transition-colors hover:bg-hover hover:text-default"
			>
				<GithubLogoIcon size={17} weight="fill" />
			</a>
			<DownloadButton />
		</div>
	</nav>
</header>

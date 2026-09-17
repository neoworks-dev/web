<script lang="ts">
	import { latent } from '$lib/latent';
	import { siteUrl } from '$lib/urls';
</script>

<footer class="border-t border-line-faint px-6 py-12">
	<div class="mx-auto flex max-w-[1120px] flex-wrap items-center gap-x-8 gap-y-4">
		<span class="text-sm font-semibold tracking-tight text-default">latent</span>
		<a href={latent.sourceUrl} class="text-sm text-muted transition-colors hover:text-default">
			Source
		</a>
		<a href={latent.releasesUrl} class="text-sm text-muted transition-colors hover:text-default">
			Releases
		</a>
		<a href={siteUrl} class="ml-auto text-sm text-muted transition-colors hover:text-default">
			Part of NeoWorks
		</a>
	</div>
</footer>

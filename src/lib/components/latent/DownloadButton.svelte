<script lang="ts">
	import DownloadSimpleIcon from 'phosphor-svelte/lib/DownloadSimpleIcon';
	import { latent } from '$lib/latent';

	let { size = 'md' }: { size?: 'md' | 'lg' } = $props();

	const sizeClasses = {
		md: 'px-5 py-2.5 text-sm',
		lg: 'px-6 py-3 text-base'
	};
</script>

<a
	href={latent.appImageUrl}
	class="inline-flex items-center gap-2 rounded-full bg-action font-semibold text-action-fg transition-opacity hover:opacity-90 active:scale-[0.98] {sizeClasses[
		size
	]}"
>
	<DownloadSimpleIcon size={17} weight="bold" />
	Download AppImage
</a>

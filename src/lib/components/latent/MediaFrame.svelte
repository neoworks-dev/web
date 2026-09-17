<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		video = '',
		poster = '',
		image = '',
		alt = '',
		children
	}: {
		/** Looping screen capture. Takes precedence over `image` once one exists. */
		video?: string;
		poster?: string;
		image?: string;
		alt?: string;
		/** Rendered while neither a capture nor a still has been supplied. */
		children?: Snippet;
	} = $props();
</script>

<div
	class="relative overflow-hidden rounded-2xl border border-line-faint bg-raised shadow-[0_24px_60px_-30px_rgba(0,0,0,0.75)]"
>
	{#if video}
		<video
			src={video}
			{poster}
			autoplay
			muted
			loop
			playsinline
			aria-label={alt}
			class="block size-full object-cover"
		></video>
	{:else if image}
		<img src={image} {alt} class="block size-full object-cover" />
	{:else if children}
		{@render children()}
	{/if}
</div>

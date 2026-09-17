<script lang="ts">
	let {
		image,
		alt,
		video = '',
		poster = ''
	}: {
		image: string;
		alt: string;
		/** Looping screen capture. Takes over from the still once one exists. */
		video?: string;
		poster?: string;
	} = $props();

	const videoPoster = $derived(resolvePoster());

	function resolvePoster() {
		if (poster) return poster;
		return image;
	}
</script>

<div
	class="overflow-hidden rounded-2xl border border-line-faint bg-raised shadow-[0_24px_60px_-30px_rgba(0,0,0,0.75)]"
>
	{#if video}
		<video
			src={video}
			poster={videoPoster}
			autoplay
			muted
			loop
			playsinline
			aria-label={alt}
			class="block size-full object-cover"
		></video>
	{:else}
		<img src={image} {alt} loading="lazy" class="block size-full object-cover" />
	{/if}
</div>

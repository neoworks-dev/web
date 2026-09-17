<script lang="ts">
	import LatentFeaturePage from '$lib/components/latent/LatentFeaturePage.svelte';
	import MediaFrame from '$lib/components/latent/MediaFrame.svelte';

	const points = [
		{
			title: 'Subject and sky in one go',
			body: 'The two selections you reach for most are a single action. Latent works out where the subject ends and the background starts, including the edges that defeat a brush.'
		},
		{
			title: 'Or point at what you want',
			body: 'Click a point, drag a box around it, and the selection grows to the thing you indicated rather than to a range of colours that happens to include it.'
		},
		{
			title: 'An ordinary mask afterwards',
			body: 'What comes back is a layer like any other: feather it, cut it with a brush, add a gradient on top, stack adjustments on it, switch it off to compare.'
		}
	];
</script>

<LatentFeaturePage
	path="/automatic-masking"
	title="Select the thing, not the pixels."
	lede="Masking is the slow part of editing, and most of that time goes on the edges. Latent makes the selection and hands you a layer to refine — the part worth your attention."
	{points}
	docsHref="/docs/latent/masks"
	docsLabel="Masks & layers in the docs"
	media={maskingMedia}
/>

{#snippet maskingMedia()}
	<MediaFrame
		image="/latent/masks.webp"
		alt="A mask in Latent shown as a red overlay, with its layer stack and adjustments beside it"
	/>
{/snippet}

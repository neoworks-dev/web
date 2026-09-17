<script lang="ts">
	import LatentFeaturePage from '$lib/components/latent/LatentFeaturePage.svelte';
	import BeforeAfter from '$lib/components/latent/BeforeAfter.svelte';

	// Stand-in pair cut from one Pexels frame. Swap for a real sky replacement.
	const sampleFrame = '/hero/8974087.jpg';
	const flatSkyLook = 'saturate(0.4) contrast(0.78) brightness(1.12)';

	const points = [
		{
			title: 'The sky is found for you',
			body: 'Latent segments the sky itself, down to the branches, wires and stray hair along the horizon — the edges that make a hand-drawn selection look pasted.'
		},
		{
			title: 'The ground follows the sky',
			body: 'A new sky changes the light in the scene. The colour and exposure underneath it are carried along, so the frame reads as one photograph rather than two.'
		},
		{
			title: 'Still just a mask',
			body: 'The result lands in the layer stack like any other mask — opacity, feather, its own adjustments, and reversible from the history at any point.'
		}
	];
</script>

<LatentFeaturePage
	path="/sky-replacement"
	title="Put the sky back the way you remember it."
	lede="Meter for the ground and the sky blows out; meter for the sky and everything below it goes black. Sky replacement gives you the frame you were looking at, with the light underneath matched to it."
	{points}
	docsHref="/docs/latent/masks"
	docsLabel="How masks work"
	media={skyMedia}
/>

{#snippet skyMedia()}
	<div class="relative aspect-video w-full overflow-hidden rounded-2xl border border-line-faint">
		<BeforeAfter
			before={sampleFrame}
			after={sampleFrame}
			beforeFilter={flatSkyLook}
			beforeLabel="Original"
			afterLabel="Replaced"
			alt="A frame before and after its sky is replaced in Latent"
		/>
	</div>
{/snippet}

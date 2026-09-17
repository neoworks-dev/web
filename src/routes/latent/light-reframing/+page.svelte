<script lang="ts">
	import LatentFeaturePage from '$lib/components/latent/LatentFeaturePage.svelte';
	import BeforeAfter from '$lib/components/latent/BeforeAfter.svelte';

	// Stand-in pair cut from one Pexels frame. Swap for a real relighting pair.
	const sampleFrame = '/hero/8974087.jpg';
	const unlitLook = 'brightness(0.72) contrast(1.05) saturate(0.85)';

	const points = [
		{
			title: 'Depth, not a brightness slider',
			body: 'Latent works out how far away things are before it touches them, so lifting the shadows reaches the subject without washing out everything behind them.'
		},
		{
			title: 'Move where the light falls',
			body: 'Re-cast the light across the scene instead of correcting for it globally — the near side warms, the far side falls away, and the frame keeps its shape.'
		},
		{
			title: 'The scene keeps its own colour',
			body: 'Relighting works with the light that was actually there rather than replacing it, so skin stays skin and a golden hour frame stays golden.'
		}
	];
</script>

<LatentFeaturePage
	path="/light-reframing"
	title="Relight the shot you actually got."
	lede="The light on the day is the one thing you cannot re-shoot. Light reframing re-casts it afterwards — a face out of shadow, a background that falls away — without flattening the frame into something that never happened."
	{points}
	docsHref="/docs/latent/develop"
	docsLabel="Develop controls in the docs"
	media={relightMedia}
/>

{#snippet relightMedia()}
	<div class="relative aspect-video w-full overflow-hidden rounded-2xl border border-line-faint">
		<BeforeAfter
			before={sampleFrame}
			after={sampleFrame}
			beforeFilter={unlitLook}
			beforeLabel="As shot"
			afterLabel="Relit"
			alt="A frame before and after being relit in Latent"
		/>
	</div>
{/snippet}

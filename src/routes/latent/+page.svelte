<script lang="ts">
	import LatentHero from '$lib/components/latent/LatentHero.svelte';
	import FeatureSection from '$lib/components/latent/FeatureSection.svelte';
	import MediaFrame from '$lib/components/latent/MediaFrame.svelte';
	import MockDevelopPanel from '$lib/components/latent/MockDevelopPanel.svelte';
	import MockHistoryPanel from '$lib/components/latent/MockHistoryPanel.svelte';
	import MockCullPanel from '$lib/components/latent/MockCullPanel.svelte';
	import OpenSourceCta from '$lib/components/latent/OpenSourceCta.svelte';
</script>

<!-- Each MediaFrame takes a `video` (and `poster`) once screen captures exist;
     until then it renders the mock panel passed as its child. -->
{#snippet developMedia()}
	<MediaFrame alt="The develop panel: histogram, light sliders and tone curve">
		<MockDevelopPanel />
	</MediaFrame>
{/snippet}

{#snippet masksMedia()}
	<MediaFrame alt="Mask groups and the editing history stack">
		<MockHistoryPanel />
	</MediaFrame>
{/snippet}

{#snippet libraryMedia()}
	<MediaFrame alt="The library grid with picks, rejects and rating filters">
		<MockCullPanel />
	</MediaFrame>
{/snippet}

<LatentHero />

<div id="develop">
	<FeatureSection
		eyebrow="Develop"
		title="Every tone in the file, under your hands."
		body="Latent reads the sensor data, not a baked JPEG. Push exposure, recover the highlights a scene blew out, and shape the response curve per channel — with a live histogram showing exactly what you spent."
		points={[
			'Exposure, contrast, highlights, shadows, whites and blacks',
			'Parametric and per-channel RGB curves',
			'Your camera’s RAW developed properly — not converted first'
		]}
		media={developMedia}
	/>
</div>

<div id="masks">
	<FeatureSection
		eyebrow="Masks & history"
		title="Nothing you do is permanent."
		body="Grade the sky without touching the subject. Stack masks into groups, switch any of them off, and walk the history back to any point in the session — the original file is never rewritten."
		points={[
			'Gradient, brush and subject masks, grouped and toggleable',
			'Full edit history you can step back through',
			'Edits stored in a sidecar; the RAW stays untouched'
		]}
		mediaFirst
		media={masksMedia}
	/>
</div>

<div id="library">
	<FeatureSection
		eyebrow="Library"
		title="Get through the shoot, then edit the keepers."
		body="Point Latent at a folder and it reads what is already there. Flag, reject and rate your way down from three hundred frames, filter to what survived, and start developing."
		points={[
			'Picks, rejects and star ratings with keyboard-speed culling',
			'Grid and filmstrip views, sorted by capture time',
			'Reads your existing folders — no import step, no proprietary catalogue'
		]}
		media={libraryMedia}
	/>
</div>

<OpenSourceCta />

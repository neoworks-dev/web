<script lang="ts">
	import LatentHero from '$lib/components/latent/LatentHero.svelte';
	import FeatureSection from '$lib/components/latent/FeatureSection.svelte';
	import MediaFrame from '$lib/components/latent/MediaFrame.svelte';
	import OpenSourceCta from '$lib/components/latent/OpenSourceCta.svelte';
</script>

<!-- Each MediaFrame swaps its still for a looping capture once given a `video`. -->
{#snippet developMedia()}
	<MediaFrame
		image="/latent/develop.webp"
		alt="Latent's develop panel: light sliders, a tone curve being edited per channel, and colour controls"
	/>
{/snippet}

{#snippet masksMedia()}
	<MediaFrame
		image="/latent/masks.webp"
		alt="A radial and brush mask overlaid in red, with its adjustment layers and the edit history"
	/>
{/snippet}

{#snippet libraryMedia()}
	<MediaFrame
		image="/latent/library.webp"
		alt="Latent's library: folders, rating and pick filters, and a filmstrip of the shoot"
	/>
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
		body="Grade the sky without touching the subject. Stack radial, gradient and brush layers into one mask, switch any of them off, and walk the history back to any point in the session — the original file is never rewritten."
		points={[
			'Radial, gradient and brush layers, combined per mask',
			'Full edit history you can step back through',
			'Edits stored in a sidecar; the RAW stays untouched'
		]}
		media={masksMedia}
	/>
</div>

<div id="library">
	<FeatureSection
		eyebrow="Library"
		title="Get through the shoot, then edit the keepers."
		body="Point Latent at a folder and it reads what is already there. Flag, reject and rate your way down from a few hundred frames, filter to what survived, and start developing."
		points={[
			'Picks, rejects and star ratings with keyboard-speed culling',
			'Grid and filmstrip views, sorted by capture time',
			'Reads your existing folders — no import step, no proprietary catalogue'
		]}
		media={libraryMedia}
	/>
</div>

<OpenSourceCta />

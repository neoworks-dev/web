<script lang="ts">
	import Hero from '$lib/components/Hero.svelte';
	import HowItWorks from '$lib/components/landing/HowItWorks.svelte';
	import WhyDifferent from '$lib/components/landing/WhyDifferent.svelte';
	import Ecosystem from '$lib/components/landing/Ecosystem.svelte';
	import DataEncrypted from '$lib/components/landing/DataEncrypted.svelte';
	import DataOwnership from '$lib/components/landing/DataOwnership.svelte';
	import Pricing from '$lib/components/landing/Pricing.svelte';
	import DeveloperTeaser from '$lib/components/landing/DeveloperTeaser.svelte';
	import Faq from '$lib/components/landing/Faq.svelte';
	import FinalCta from '$lib/components/landing/FinalCta.svelte';


</script>

<svelte:head>
	<title>NeoWorks — Your life is out there, reclaim it</title>
	<meta name="description" content="NeoWorks builds everyday apps — maps, chat, a canvas for ideas — encrypted on your device before they leave it, so no company can read or sell your data. €2 a month, no ads." />
</svelte:head>

<main>
	<Hero />
	<HowItWorks />
	<WhyDifferent />
	<Ecosystem />
	<DataEncrypted />
	<DataOwnership />
	<Pricing />
	<DeveloperTeaser />
	<Faq />
	<FinalCta />
</main>

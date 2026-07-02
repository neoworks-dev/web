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
	<title>NeoWorks — One account for every app, owned by you</title>
	<meta name="description" content="NeoWorks is an encrypted identity and data layer. One account across an open ecosystem of apps — your data encrypted with keys only you hold, priced at cost." />
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

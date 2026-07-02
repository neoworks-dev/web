<script lang="ts">
	import DeveloperHero from '$lib/components/dev/DeveloperHero.svelte';
	import DevCapabilities from '$lib/components/dev/DevCapabilities.svelte';
	import StorageModel from '$lib/components/dev/StorageModel.svelte';
	import DevRevenue from '$lib/components/dev/DevRevenue.svelte';
	import DevBuildSteps from '$lib/components/dev/DevBuildSteps.svelte';
	import DevOpenSchema from '$lib/components/dev/DevOpenSchema.svelte';
	import DevScopes from '$lib/components/dev/DevScopes.svelte';
	import DevTechStack from '$lib/components/dev/DevTechStack.svelte';
	import DevSelfHost from '$lib/components/dev/DevSelfHost.svelte';
	import DevCta from '$lib/components/dev/DevCta.svelte';
</script>

<svelte:head>
	<title>Build on NeoWorks — Developer platform</title>
	<meta
		name="description"
		content="Ship apps on a platform that pays you back. OAuth, OpenSchema, SurrealDB access, and €1.50/user/month built-in revenue sharing."
	/>
</svelte:head>

<div class="overflow-x-hidden">
	<DeveloperHero />
	<DevCapabilities />
	<StorageModel />
	<DevRevenue />
	<DevBuildSteps />
	<DevOpenSchema />
	<DevScopes />
	<DevTechStack />
	<DevSelfHost />
	<DevCta />
</div>

<script lang="ts">
	import RefreshTokensTable from '$lib/components/dashboard/RefreshTokensTable.svelte';
	import WidgetCard from '$lib/components/dashboard/WidgetCard.svelte';
	import KeyIcon from 'phosphor-svelte/lib/KeyIcon';
	import PageHeader from '$lib/components/dashboard/PageHeader.svelte';
</script>

<svelte:head>
	<title>API Tokens — NeoWorks</title>
</svelte:head>

<div class="h-full overflow-y-auto space-y-2">
	<PageHeader title="API Tokens" subtitle="Active OAuth refresh tokens for your account." />

	<WidgetCard
		title="API Tokens"
		subtitle="Active OAuth refresh tokens for your account."
		icon={KeyIcon}
	>
		<RefreshTokensTable />
	</WidgetCard>
</div>

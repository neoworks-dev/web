<script lang="ts">
	import type { PageData } from './$types';
	import WidgetGrid, { type WidgetLayout, type AvailableWidget } from '$lib/components/dashboard/WidgetGrid.svelte';
	import Widget from '$lib/components/dashboard/Widget.svelte';
	import RefreshTokensTable from '$lib/components/dashboard/RefreshTokensTable.svelte';
	import StorageOverview from '$lib/components/dashboard/StorageOverview.svelte';
	import RecentUploads from '$lib/components/dashboard/RecentUploads.svelte';
	import OrganizationsWidget from '$lib/components/dashboard/OrganizationsWidget.svelte';
	import RecentClientsWidget from '$lib/components/dashboard/RecentClientsWidget.svelte';
	import KeyIcon from 'phosphor-svelte/lib/KeyIcon';
	import HardDriveIcon from 'phosphor-svelte/lib/HardDriveIcon';
	import ClockIcon from 'phosphor-svelte/lib/ClockIcon';
	import BuildingsIcon from 'phosphor-svelte/lib/BuildingsIcon';

	let { data }: { data: PageData } = $props();

	let layouts = $state<WidgetLayout[]>([
		{ id: 'welcome',    type: 'overview',       x: 0,   y: 0,   w: 384, h: 128, suggestedW: 384, suggestedH: 128 },
		{ id: 'api-tokens', type: 'api-tokens',     x: 416, y: 0,   w: 384, h: 384, suggestedW: 384, suggestedH: 384 },
		{ id: 'activity',   type: 'activity',       x: 0,   y: 160, w: 384, h: 224, suggestedW: 384, suggestedH: 224 },
		{ id: 'organizations', type: 'organizations',  x: 0,   y: 160, w: 384, h: 256, suggestedW: 384, suggestedH: 256 },
		{ id: 'recent-clients', type: 'recent-clients', x: 416, y: 416, w: 384, h: 256, suggestedW: 384, suggestedH: 256 },
		{ id: 'storage',    type: 'storage',        x: 0,   y: 432, w: 800, h: 416, suggestedW: 800, suggestedH: 416 },
		{ id: 'uploads',    type: 'recent-uploads', x: 416, y: 688, w: 384, h: 416, suggestedW: 384, suggestedH: 416 },
	]);

	const availableWidgets: AvailableWidget[] = [
		{ type: 'overview',       label: 'Overview',        defaultW: 384, defaultH: 128 },
		{ type: 'api-tokens',     label: 'API Tokens',      defaultW: 384, defaultH: 384 },
		{ type: 'organizations',  label: 'Organizations',   defaultW: 384, defaultH: 256 },
		{ type: 'recent-clients', label: 'Recent Clients',  defaultW: 384, defaultH: 256 },
		{ type: 'activity',       label: 'Activity',        defaultW: 384, defaultH: 224 },
		{ type: 'storage',        label: 'Storage',         defaultW: 800, defaultH: 416 },
		{ type: 'recent-uploads', label: 'Recent Uploads',  defaultW: 384, defaultH: 416 },
	];
</script>

<svelte:head>
	<title>Dashboard — NeoWorks</title>
</svelte:head>

<WidgetGrid bind:layouts {availableWidgets} storageKey="neoworks:dashboard-layout">
	{#snippet widget(layout, handlers)}
		{#if layout.type === 'overview'}
			<Widget title="Overview" {...handlers}>
				<div class="p-5">
					<p class="text-sm font-medium text-default">Welcome back, {data.user.email}</p>
					<p class="text-xs text-dim mt-1">
						Member since {new Date(data.user.created_at).toLocaleDateString()}
					</p>
				</div>
			</Widget>

		{:else if layout.type === 'api-tokens'}
			<Widget
				title="API Tokens"
				subtitle="Active OAuth refresh tokens for your account."
				icon={KeyIcon}
				{...handlers}
			>
				<RefreshTokensTable />
			</Widget>

		{:else if layout.type === 'organizations'}
			<Widget
				title="Organizations"
				subtitle="Organizations you own or belong to."
				icon={BuildingsIcon}
				{...handlers}
			>
				<OrganizationsWidget />
			</Widget>

		{:else if layout.type === 'recent-clients'}
			<Widget
				title="Recent Clients"
				subtitle="Clients you accessed most recently."
				icon={KeyIcon}
				{...handlers}
			>
				<RecentClientsWidget />
			</Widget>

		{:else if layout.type === 'activity'}
			<Widget title="Activity" {...handlers}>
				<div class="p-5 text-sm text-dim">No recent activity.</div>
			</Widget>

		{:else if layout.type === 'storage'}
			<Widget
				title="Storage"
				subtitle="Documents, photos & videos — database storage billed separately"
				icon={HardDriveIcon}
				{...handlers}
			>
				<StorageOverview />
			</Widget>

		{:else if layout.type === 'recent-uploads'}
			<Widget
				title="Recent Uploads"
				subtitle="Latest images and documents added to your storage."
				icon={ClockIcon}
				{...handlers}
			>
				<RecentUploads />
			</Widget>
		{/if}
	{/snippet}
</WidgetGrid>

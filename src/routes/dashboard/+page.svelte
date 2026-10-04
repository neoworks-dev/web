<script lang="ts">
	import type { PageData } from './$types';
	import WidgetGrid, { type WidgetLayout, type AvailableWidget } from '$lib/components/dashboard/WidgetGrid.svelte';
	import Widget from '$lib/components/dashboard/Widget.svelte';
	import StorageOverview from '$lib/components/dashboard/StorageOverview.svelte';
	import RecentUploads from '$lib/components/dashboard/RecentUploads.svelte';
	import HardDriveIcon from 'phosphor-svelte/lib/HardDriveIcon';
	import ClockIcon from 'phosphor-svelte/lib/ClockIcon';

	let { data }: { data: PageData } = $props();

	let layouts = $state<WidgetLayout[]>([
		{ id: 'welcome',    type: 'overview',       x: 0,   y: 0,   w: 384, h: 128, suggestedW: 384, suggestedH: 128 },
		{ id: 'activity',   type: 'activity',       x: 0,   y: 160, w: 384, h: 224, suggestedW: 384, suggestedH: 224 },
		{ id: 'storage',    type: 'storage',        x: 0,   y: 432, w: 800, h: 416, suggestedW: 800, suggestedH: 416 },
		{ id: 'uploads',    type: 'recent-uploads', x: 416, y: 688, w: 384, h: 416, suggestedW: 384, suggestedH: 416 },
	]);

	const availableWidgets: AvailableWidget[] = [
		{ type: 'overview',       label: 'Overview',        defaultW: 384, defaultH: 128 },
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

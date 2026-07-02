<script lang="ts">
	import StorageOverview from '$lib/components/dashboard/StorageOverview.svelte';
	import RecentUploads from '$lib/components/dashboard/RecentUploads.svelte';
	import WidgetCard from '$lib/components/dashboard/WidgetCard.svelte';
	import HardDriveIcon from 'phosphor-svelte/lib/HardDriveIcon';
	import ClockIcon from 'phosphor-svelte/lib/ClockIcon';
	import PageHeader from '$lib/components/dashboard/PageHeader.svelte';
</script>

<svelte:head>
	<title>Storage — NeoWorks</title>
</svelte:head>

<div class="h-full overflow-y-auto space-y-2">
	<PageHeader title="Storage" subtitle="Documents, photos and videos stored for your account." />

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-2 items-start">
		<WidgetCard
			title="Storage"
			subtitle="Documents, photos & videos — database storage billed separately"
			icon={HardDriveIcon}
		>
			<StorageOverview />
		</WidgetCard>

		<WidgetCard
			title="Recent Uploads"
			subtitle="Latest images and documents added to your storage."
			icon={ClockIcon}
		>
			<RecentUploads />
		</WidgetCard>
	</div>
</div>

<script lang="ts">
	import { getRecentClients, type RecentClient } from '$lib/recentClients';
	import KeyIcon from 'phosphor-svelte/lib/KeyIcon';
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';

	let recents = $state<RecentClient[]>([]);

	$effect(() => {
		recents = getRecentClients();
	});

	function relativeTime(at: number): string {
		const seconds = Math.round((Date.now() - at) / 1000);
		if (seconds < 60) return 'just now';
		const minutes = Math.round(seconds / 60);
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.round(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.round(hours / 24);
		return `${days}d ago`;
	}
</script>

<div class="p-4">
	{#if recents.length === 0}
		<div class="flex flex-col items-center justify-center py-10 text-center">
			<KeyIcon size={28} class="text-dim mb-3" />
			<p class="text-[13px] font-medium text-muted">No clients accessed yet</p>
			<p class="text-[12px] text-dim mt-1">Open a client to see it here.</p>
		</div>
	{:else}
		<div class="space-y-2">
			{#each recents as client (client.id)}
				<a
					href={`/dashboard/organizations/${client.orgId}/clients/${client.id}`}
					class="group flex items-center gap-3 rounded-lg border border-line-faint bg-surface p-3 hover:border-line-strong transition-colors"
				>
					<div class="w-8 h-8 rounded-md bg-raised border border-line-faint flex items-center justify-center text-muted shrink-0">
						<KeyIcon size={15} />
					</div>
					<div class="min-w-0 flex-1">
						<p class="text-[13px] font-mono font-medium text-default truncate">{client.name}</p>
						<p class="text-[11px] text-dim truncate">{relativeTime(client.at)}</p>
					</div>
					<CaretRightIcon size={14} class="text-dim group-hover:text-default transition-colors shrink-0" />
				</a>
			{/each}
		</div>
	{/if}
</div>

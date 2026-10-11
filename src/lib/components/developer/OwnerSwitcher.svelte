<script lang="ts">
	import { goto } from '$app/navigation';
	import type { OwnerWithGrants } from '@neoworks-dev/sdk';
	import { Select } from '@neoworks-dev/ui';

	let {
		owners,
		currentHandle,
		collapsed = false,
	}: { owners: OwnerWithGrants[]; currentHandle: string; collapsed?: boolean } = $props();

	function describe(entry: OwnerWithGrants): string {
		if (entry.owner.kind === 'user') {
			return 'Personal';
		}
		return `Organization · @${entry.owner.handle}`;
	}

	function labelFor(entry: OwnerWithGrants): string {
		if (entry.owner.kind === 'user') {
			return `@${entry.owner.handle}`;
		}
		return entry.owner.displayName;
	}

	const options = $derived(
		owners.map((entry) => ({ value: entry.owner.handle, label: labelFor(entry), description: describe(entry) })),
	);

	function switchTo(value: string | string[]) {
		if (typeof value !== 'string') {
			return;
		}
		goto(`/dashboard/developer/${value}`);
	}
</script>

{#if collapsed}
	<a
		href="/dashboard/developer/{currentHandle}"
		title="Switch owner"
		class="mx-auto flex size-9 items-center justify-center rounded-full border border-line-faint bg-raised text-xs font-semibold text-muted"
	>
		{currentHandle.slice(0, 1).toUpperCase()}
	</a>
{:else}
	<div class="px-1 pb-1" data-testid="owner-switcher">
		<Select value={currentHandle} onChange={switchTo} {options} size="sm" placeholder="Choose an owner" />
	</div>
{/if}

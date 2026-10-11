<script lang="ts">
	import { StatusBadge } from '@neoworks-dev/ui';
	import TextField from './TextField.svelte';

	let {
		value = $bindable(''),
		error = '',
		label = 'Handle',
		name = 'handle',
	}: { value?: string; error?: string; label?: string; name?: string } = $props();

	type Availability = { available: boolean; reason?: 'taken' | 'reserved' | 'invalid' };

	const UNAVAILABLE_TEXT = {
		taken: 'Already taken',
		reserved: 'Reserved',
		invalid: '2-39 characters: lowercase letters, digits and dashes',
	};

	let availability = $state<Availability | null>(null);
	let pendingCheck: ReturnType<typeof setTimeout> | undefined;

	async function check(handle: string) {
		const response = await fetch(`/dashboard/developer/availability?handle=${encodeURIComponent(handle)}`);
		if (!response.ok) {
			availability = null;
			return;
		}
		availability = (await response.json()) as Availability;
	}

	function scheduleCheck(handle: string) {
		clearTimeout(pendingCheck);
		availability = null;
		if (handle === '') {
			return;
		}
		pendingCheck = setTimeout(() => check(handle), 250);
	}

	$effect(() => {
		scheduleCheck(value);
	});
</script>

<div class="flex flex-col gap-1.5">
	<TextField {label} {name} bind:value placeholder="acme" {error} />
	{#if availability !== null && availability.available}
		<div data-testid="handle-availability"><StatusBadge tone="green">Available</StatusBadge></div>
	{:else if availability !== null && availability.reason !== undefined}
		<div data-testid="handle-availability">
			<StatusBadge tone="red">{UNAVAILABLE_TEXT[availability.reason]}</StatusBadge>
		</div>
	{/if}
</div>

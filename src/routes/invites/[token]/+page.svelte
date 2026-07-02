<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { sdk } from '$lib/sdk';
	import CheckCircleIcon from 'phosphor-svelte/lib/CheckCircleIcon';
	import WarningCircleIcon from 'phosphor-svelte/lib/WarningCircleIcon';
	import type { Organization } from '@neoworks-dev/sdk';

	let status = $state<'working' | 'done' | 'error'>('working');
	let error = $state<string | null>(null);
	let organization = $state<Organization | null>(null);

	const token = $page.params.token ?? "";

	async function accept(): Promise<void> {
		status = 'working';
		error = null;
		try {
			organization = await sdk.organizations.acceptInvite(token);
			status = 'done';
		} catch (e: any) {
			error = e?.message ?? 'Could not accept this invitation.';
			status = 'error';
		}
	}

	accept();
</script>

<svelte:head>
	<title>Accept invitation — NeoWorks</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center p-6">
	<div class="w-full max-w-md rounded-2xl border border-line-faint bg-elevated p-8 text-center space-y-4">
		{#if status === 'working'}
			<div class="skeleton h-12 w-12 rounded-full mx-auto"></div>
			<p class="text-[14px] text-muted">Accepting your invitation…</p>
		{:else if status === 'done'}
			<CheckCircleIcon size={48} weight="fill" class="text-green mx-auto" />
			<h1 class="text-[18px] font-semibold text-default">You're in</h1>
			<p class="text-[13px] text-dim">
				You've joined <span class="font-medium text-default">{organization?.name}</span>.
			</p>
			<button
				class="h-9 px-4 rounded-lg bg-primary text-primary-content text-[13px] font-medium hover:opacity-90 transition-opacity"
				onclick={() => goto(`/dashboard/organizations/${organization?.id}/clients`)}
			>
				Open organization
			</button>
		{:else}
			<WarningCircleIcon size={48} weight="fill" class="text-red mx-auto" />
			<h1 class="text-[18px] font-semibold text-default">Couldn't accept invitation</h1>
			<p class="text-[13px] text-dim">{error}</p>
			<button
				class="h-9 px-4 rounded-lg border border-line text-[13px] text-muted hover:text-default transition-colors"
				onclick={accept}
			>
				Try again
			</button>
		{/if}
	</div>
</div>

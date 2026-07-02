<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { Snippet } from 'svelte';
	import XIcon from 'phosphor-svelte/lib/XIcon';
	import Stepper from '$lib/components/organizations/onboarding/Stepper.svelte';

	let { children }: { children: Snippet } = $props();

	const steps = ['Details', 'Invite', 'Billing'];

	// Derive the active step from the route so each page stays self-contained.
	const currentStep = $derived.by(() => {
		const path = $page.url.pathname;
		if (path.endsWith('/billing')) return 2;
		if (path.endsWith('/invite')) return 1;
		return 0;
	});

	function cancel() {
		goto('/dashboard/organizations');
	}
</script>

<div class="h-full overflow-y-auto">
	<div class="mx-auto w-full max-w-xl px-6 py-8 space-y-8">
		<div class="flex items-start justify-between gap-4">
			<div>
				<h1 class="text-[18px] font-semibold text-default">New organization</h1>
				<p class="text-[13px] text-dim mt-0.5">Set up your organization in a few steps.</p>
			</div>
			<button
				class="text-dim hover:text-default transition-colors"
				onclick={cancel}
				aria-label="Cancel"
			>
				<XIcon size={18} />
			</button>
		</div>

		<Stepper {steps} current={currentStep} />

		<div class="rounded-2xl border border-line bg-elevated shadow-sm p-6">
			{@render children()}
		</div>
	</div>
</div>

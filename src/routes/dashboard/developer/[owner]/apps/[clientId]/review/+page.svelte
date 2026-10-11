<script lang="ts">
	import { enhance } from '$app/forms';
	import { StatusBadge } from '@neoworks-dev/ui';
	import WidgetCard from '$lib/components/dashboard/WidgetCard.svelte';
	import FormMessage from '$lib/components/developer/FormMessage.svelte';
	import PermissionButton from '$lib/components/developer/PermissionButton.svelte';
	import TextField from '$lib/components/developer/TextField.svelte';
	import { fieldError, type FormFailureData } from '$lib/developer/formErrors';
	import { reviewLabel, reviewTone } from '$lib/developer/status';
	import SealCheckIcon from 'phosphor-svelte/lib/SealCheckIcon';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const failure = $derived(form as FormFailureData | null);
	const canReview = $derived(data.app.myPermissions.includes('apps.review'));
	let privacyPolicyUrl = $state('');
	let supportContact = $state('');
</script>

<div class="space-y-2">
	<WidgetCard title="Status" subtitle="Review decides whether the consent screen shows the app as reviewed." icon={SealCheckIcon}>
		<div class="flex flex-col gap-3 p-4">
			<div class="flex flex-wrap items-center gap-2">
				<span class="text-sm text-muted">Review</span>
				<StatusBadge tone={reviewTone(data.app.review.status)}>{reviewLabel(data.app.review.status)}</StatusBadge>
				<span class="text-sm text-muted">Verification</span>
				{#if data.app.verified}
					<StatusBadge tone="green">Verified</StatusBadge>
				{:else}
					<StatusBadge>Unverified</StatusBadge>
				{/if}
			</div>
			{#if data.app.review.reason !== null}
				<p class="rounded-lg bg-red-soft px-3 py-2 text-sm text-red">{data.app.review.reason}</p>
			{/if}
			{#if !data.app.verified}
				<p class="text-sm text-dim">
					An app is verified when its https redirect URIs are on a verified domain.
					<a class="text-blue hover:underline" href="/dashboard/developer/{data.owner.handle}/domains">Manage domains</a>
				</p>
			{/if}
		</div>
	</WidgetCard>

	<WidgetCard title="Submit for review" icon={SealCheckIcon}>
		<form method="POST" action="?/submit" use:enhance class="flex max-w-2xl flex-col gap-4 p-4">
			<TextField
				label="Privacy policy URL"
				name="privacyPolicyUrl"
				type="url"
				bind:value={privacyPolicyUrl}
				placeholder="https://example.com/privacy"
				disabled={!canReview}
				error={fieldError(failure, 'submit', 'privacyPolicyUrl')}
			/>
			<TextField
				label="Support contact"
				name="supportContact"
				bind:value={supportContact}
				placeholder="support@example.com"
				disabled={!canReview}
				error={fieldError(failure, 'submit', 'supportContact')}
			/>
			<FormMessage form={failure} name="submit" fields={['privacyPolicyUrl', 'supportContact']} />
			<div>
				<PermissionButton allowed={canReview} permission="apps.review" variant="primary">Submit for review</PermissionButton>
			</div>
		</form>
	</WidgetCard>
</div>

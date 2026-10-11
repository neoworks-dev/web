<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '@neoworks-dev/ui';
	import WidgetCard from '$lib/components/dashboard/WidgetCard.svelte';
	import FormMessage from '$lib/components/developer/FormMessage.svelte';
	import PermissionButton from '$lib/components/developer/PermissionButton.svelte';
	import TextField from '$lib/components/developer/TextField.svelte';
	import type { FormFailureData } from '$lib/developer/formErrors';
	import WarningIcon from 'phosphor-svelte/lib/WarningIcon';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const failure = $derived(form as FormFailureData | null);
	const canDelete = $derived(data.app.myPermissions.includes('apps.delete'));
	let confirmation = $state('');
	const confirmed = $derived(confirmation === data.app.name);
</script>

<WidgetCard title="Delete app" subtitle="Revokes all tokens of this app immediately. This cannot be undone." icon={WarningIcon}>
	<form method="POST" action="?/delete" use:enhance class="flex max-w-md flex-col gap-4 p-4">
		<TextField
			label="Type {data.app.name} to confirm"
			name="confirmation"
			bind:value={confirmation}
			disabled={!canDelete}
		/>
		<FormMessage form={failure} name="delete" />
		<div>
			{#if canDelete}
				<Button type="submit" variant="danger" size="sm" disabled={!confirmed}>Delete app</Button>
			{:else}
				<PermissionButton allowed={false} permission="apps.delete" variant="danger">Delete app</PermissionButton>
			{/if}
		</div>
	</form>
</WidgetCard>

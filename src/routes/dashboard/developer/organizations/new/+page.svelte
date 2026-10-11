<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '@neoworks-dev/ui';
	import PageHeader from '$lib/components/dashboard/PageHeader.svelte';
	import WidgetCard from '$lib/components/dashboard/WidgetCard.svelte';
	import HandleField from '$lib/components/developer/HandleField.svelte';
	import TextField from '$lib/components/developer/TextField.svelte';
	import FormMessage from '$lib/components/developer/FormMessage.svelte';
	import { fieldError, type FormFailureData } from '$lib/developer/formErrors';
	import BuildingsIcon from 'phosphor-svelte/lib/BuildingsIcon';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	const failure = $derived(form as FormFailureData | null);
	let handle = $state('');
	let displayName = $state('');
</script>

<svelte:head>
	<title>New organization — NeoWorks</title>
</svelte:head>

<div class="h-full space-y-2 overflow-y-auto">
	<PageHeader
		title="New organization"
		subtitle="Organizations publish apps and schemas together. You get every permission and can invite others."
	/>

	<WidgetCard title="Organization" subtitle="The handle is permanent and becomes the organization scope." icon={BuildingsIcon}>
		<form method="POST" action="?/create" use:enhance class="flex max-w-md flex-col gap-4 p-4">
			<HandleField bind:value={handle} label="Organization handle" error={fieldError(failure, 'create', 'handle')} />
			<TextField
				label="Display name"
				name="displayName"
				bind:value={displayName}
				placeholder="Acme Inc"
				error={fieldError(failure, 'create', 'displayName')}
			/>
			<FormMessage form={failure} name="create" fields={['handle', 'displayName']} />
			<div>
				<Button type="submit" variant="primary">Create organization</Button>
			</div>
		</form>
	</WidgetCard>
</div>

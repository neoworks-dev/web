<script lang="ts">
	import { enhance } from '$app/forms';
	import WidgetCard from '$lib/components/dashboard/WidgetCard.svelte';
	import AppFormFields from '$lib/components/developer/AppFormFields.svelte';
	import FormMessage from '$lib/components/developer/FormMessage.svelte';
	import PermissionButton from '$lib/components/developer/PermissionButton.svelte';
	import { keepFormValues } from '$lib/developer/enhance';
	import type { FormFailureData } from '$lib/developer/formErrors';
	import GearIcon from 'phosphor-svelte/lib/GearIcon';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const failure = $derived(form as FormFailureData | null);
	const canEdit = $derived(data.app.myPermissions.includes('apps.edit'));
	const saved = $derived(form !== null && form !== undefined && 'saved' in form);
</script>

<WidgetCard title="Settings" subtitle="Everything except the app type can change." icon={GearIcon}>
	<form method="POST" action="?/save" use:enhance={keepFormValues} class="flex max-w-2xl flex-col gap-5 p-4">
		<AppFormFields
			app={data.app}
			schemas={data.schemas}
			form={failure}
			formName="save"
			disabled={!canEdit}
		/>
		<FormMessage form={failure} name="save" fields={['name', 'description', 'homepage', 'redirectUris', 'scopes']} />
		{#if saved}
			<p class="text-sm text-green" role="status">Settings saved.</p>
		{/if}
		<div>
			<PermissionButton allowed={canEdit} permission="apps.edit" variant="primary">Save settings</PermissionButton>
		</div>
	</form>
</WidgetCard>

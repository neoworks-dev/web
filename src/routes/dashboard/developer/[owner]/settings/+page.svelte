<script lang="ts">
	import { untrack } from 'svelte';
	import { enhance } from '$app/forms';
	import PageHeader from '$lib/components/dashboard/PageHeader.svelte';
	import WidgetCard from '$lib/components/dashboard/WidgetCard.svelte';
	import FormMessage from '$lib/components/developer/FormMessage.svelte';
	import PermissionButton from '$lib/components/developer/PermissionButton.svelte';
	import TextField from '$lib/components/developer/TextField.svelte';
	import { keepFormValues } from '$lib/developer/enhance';
	import { fieldError, type FormFailureData } from '$lib/developer/formErrors';
	import { holdsPermission } from '$lib/developer/permissions';
	import GearIcon from 'phosphor-svelte/lib/GearIcon';
	import WarningIcon from 'phosphor-svelte/lib/WarningIcon';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const failure = $derived(form as FormFailureData | null);
	const canManage = $derived(holdsPermission(data.grants, 'organization.manage'));
	let displayName = $state(untrack(() => data.owner.displayName));
</script>

<svelte:head>
	<title>Organization settings — NeoWorks</title>
</svelte:head>

<div class="h-full space-y-2 overflow-y-auto">
	<PageHeader title="Organization settings" subtitle="@{data.owner.handle}" />

	{#if data.organization === null}
		<p class="rounded-xl border border-line-faint bg-elevated p-5 text-sm text-dim">Personal accounts have no organization settings.</p>
	{:else}
		<WidgetCard title="Profile" subtitle="The handle is permanent; only the display name can change." icon={GearIcon}>
			<form method="POST" action="?/rename" use:enhance={keepFormValues} class="flex max-w-md flex-col gap-4 p-4">
				<TextField
					label="Display name"
					name="displayName"
					bind:value={displayName}
					disabled={!canManage}
					error={fieldError(failure, 'rename', 'displayName')}
				/>
				<FormMessage form={failure} name="rename" fields={['displayName']} />
				<div>
					<PermissionButton allowed={canManage} permission="organization.manage" variant="primary">
						Save name
					</PermissionButton>
				</div>
			</form>
		</WidgetCard>

		<WidgetCard
			title="Archive organization"
			subtitle="Allowed once it owns no apps. Published schemas stay readable and the handle stays reserved."
			icon={WarningIcon}
		>
			<form method="POST" action="?/archive" use:enhance class="flex max-w-md flex-col gap-4 p-4">
				<FormMessage form={failure} name="archive" />
				<div>
					<PermissionButton allowed={canManage} permission="organization.manage" variant="danger">
						Archive organization
					</PermissionButton>
				</div>
			</form>
		</WidgetCard>
	{/if}
</div>

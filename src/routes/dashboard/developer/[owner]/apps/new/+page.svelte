<script lang="ts">
	import { enhance } from '$app/forms';
	import PageHeader from '$lib/components/dashboard/PageHeader.svelte';
	import WidgetCard from '$lib/components/dashboard/WidgetCard.svelte';
	import AppFormFields from '$lib/components/developer/AppFormFields.svelte';
	import FormMessage from '$lib/components/developer/FormMessage.svelte';
	import PermissionButton from '$lib/components/developer/PermissionButton.svelte';
	import SecretOnce from '$lib/components/developer/SecretOnce.svelte';
	import { holdsPermission } from '$lib/developer/permissions';
	import type { FormFailureData } from '$lib/developer/formErrors';
	import AppWindowIcon from 'phosphor-svelte/lib/AppWindowIcon';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const failure = $derived(form as FormFailureData | null);
	type CreatedApp = { clientId: string; name: string; type: string; clientSecret?: string };
	const created = $derived.by(() => {
		const result = form as { created?: CreatedApp } | null;
		if (result === null || result.created === undefined) {
			return null;
		}
		return result.created;
	});
	const fieldNames = ['name', 'description', 'homepage', 'redirectUris', 'scopes'];
	const canCreate = $derived(holdsPermission(data.grants, 'apps.create'));
	let type = $state('public');
</script>

<svelte:head>
	<title>New app — NeoWorks</title>
</svelte:head>

<div class="h-full space-y-2 overflow-y-auto">
	<PageHeader title="Register an app" subtitle="Apps sign users in with OAuth and ask for the scopes you pick." />

	{#if created !== null}
		<WidgetCard title="{created.name} was registered" icon={AppWindowIcon}>
			<div class="flex flex-col gap-4 p-4" data-testid="app-created">
				<div class="flex flex-col gap-1">
					<p class="text-xs font-medium text-muted">Client ID</p>
					<code class="font-mono text-sm text-default" data-testid="client-id">{created.clientId}</code>
				</div>
				{#if created.clientSecret !== undefined}
					<SecretOnce secret={created.clientSecret} />
				{:else}
					<p class="text-sm text-dim">This is a public app: it uses PKCE and has no client secret.</p>
				{/if}
				<a class="text-sm font-medium text-blue hover:underline" href="/dashboard/developer/{data.owner.handle}/apps/{created.clientId}">
					Open {created.name}
				</a>
			</div>
		</WidgetCard>
	{:else}
		<WidgetCard title="App details" icon={AppWindowIcon}>
			<form method="POST" action="?/create" use:enhance class="flex max-w-2xl flex-col gap-5 p-4">
				<fieldset class="flex flex-col gap-2">
					<legend class="text-xs font-medium text-muted">Type</legend>
					<label class="flex items-start gap-2 text-sm text-default">
						<input type="radio" name="type" value="public" bind:group={type} class="mt-1" />
						<span>Public <span class="text-dim">(browser or mobile app, signs in with PKCE, no secret)</span></span>
					</label>
					<label class="flex items-start gap-2 text-sm text-default">
						<input type="radio" name="type" value="confidential" bind:group={type} class="mt-1" />
						<span>Confidential <span class="text-dim">(server-side app with a client secret)</span></span>
					</label>
				</fieldset>

				<AppFormFields schemas={data.schemas} form={failure} formName="create" />

				<FormMessage form={failure} name="create" fields={fieldNames} />
				<div>
					<PermissionButton allowed={canCreate} permission="apps.create" variant="primary">Register app</PermissionButton>
				</div>
			</form>
		</WidgetCard>
	{/if}
</div>

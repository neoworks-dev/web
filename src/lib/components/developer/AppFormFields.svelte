<script lang="ts">
	import { untrack } from 'svelte';
	import type { DeveloperApp, RegistrySchema, RequestedScope } from '@neoworks-dev/sdk';
	import { fieldError, type FormFailureData } from '$lib/developer/formErrors';
	import TextField from './TextField.svelte';
	import ScopePicker from './ScopePicker.svelte';

	let {
		app = undefined,
		schemas,
		form,
		formName,
		disabled = false,
	}: {
		app?: DeveloperApp;
		schemas: RegistrySchema[];
		form: FormFailureData | null | undefined;
		formName: string;
		disabled?: boolean;
	} = $props();

	function initialText(value: string | undefined): string {
		if (value === undefined) {
			return '';
		}
		return value;
	}

	function initialScopes(): RequestedScope[] {
		if (app === undefined) {
			return [];
		}
		return app.scopes.map((entry) => ({ ...entry }));
	}

	let name = $state(untrack(() => initialText(app?.name)));
	let description = $state(untrack(() => initialText(app?.description)));
	let homepage = $state(untrack(() => initialText(app?.homepage)));
	let redirectUris = $state(untrack(() => initialText(app?.redirectUris.join('\n'))));
	let scopes = $state(untrack(initialScopes));
</script>

<div class="flex flex-col gap-4">
	<TextField label="Name" name="name" bind:value={name} {disabled} error={fieldError(form, formName, 'name')} />
	<TextField
		label="Description"
		name="description"
		bind:value={description}
		multiline
		rows={2}
		{disabled}
		error={fieldError(form, formName, 'description')}
	/>
	<TextField
		label="Homepage"
		name="homepage"
		type="url"
		placeholder="https://example.com"
		bind:value={homepage}
		{disabled}
		error={fieldError(form, formName, 'homepage')}
	/>
	<TextField
		label="Redirect URIs"
		name="redirectUris"
		bind:value={redirectUris}
		multiline
		rows={3}
		{disabled}
		hint="One per line: https://…, http://localhost:<port>/…, http://127.0.0.1:<port>/… or com.example.app://…"
		error={fieldError(form, formName, 'redirectUris')}
	/>
	<ScopePicker {schemas} bind:selected={scopes} {disabled} error={fieldError(form, formName, 'scopes')} />
</div>

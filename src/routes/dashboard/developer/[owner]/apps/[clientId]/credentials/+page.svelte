<script lang="ts">
	import { enhance } from '$app/forms';
	import WidgetCard from '$lib/components/dashboard/WidgetCard.svelte';
	import FormMessage from '$lib/components/developer/FormMessage.svelte';
	import PermissionButton from '$lib/components/developer/PermissionButton.svelte';
	import SecretOnce from '$lib/components/developer/SecretOnce.svelte';
	import type { FormFailureData } from '$lib/developer/formErrors';
	import KeyIcon from 'phosphor-svelte/lib/KeyIcon';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const failure = $derived(form as FormFailureData | null);
	const newSecret = $derived.by(() => {
		const result = form as { clientSecret?: string } | null;
		if (result === null || result.clientSecret === undefined) {
			return null;
		}
		return result.clientSecret;
	});
	const canRotate = $derived(data.app.myPermissions.includes('apps.secrets'));
</script>

<WidgetCard title="Credentials" subtitle="Use the client ID to start the OAuth flow." icon={KeyIcon}>
	<div class="flex max-w-2xl flex-col gap-4 p-4">
		<div class="flex flex-col gap-1">
			<p class="text-xs font-medium text-muted">Client ID</p>
			<code class="font-mono text-sm text-default" data-testid="client-id">{data.app.id}</code>
		</div>

		{#if data.app.type === 'public'}
			<p class="text-sm text-dim">This is a public app: it signs in with PKCE and has no client secret.</p>
		{:else}
			{#if newSecret !== null}
				<SecretOnce secret={newSecret} title="New client secret" />
			{/if}
			<FormMessage form={failure} name="rotate" />
			<form method="POST" action="?/rotate" use:enhance class="flex flex-col gap-2">
				<p class="text-sm text-dim">
					Rotating issues a new secret immediately and invalidates the old one. The new secret is shown once.
				</p>
				<div>
					<PermissionButton allowed={canRotate} permission="apps.secrets">Rotate secret</PermissionButton>
				</div>
			</form>
		{/if}
	</div>
</WidgetCard>

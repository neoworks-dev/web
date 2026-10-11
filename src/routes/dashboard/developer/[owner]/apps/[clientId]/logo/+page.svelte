<script lang="ts">
	import { enhance } from '$app/forms';
	import WidgetCard from '$lib/components/dashboard/WidgetCard.svelte';
	import FormMessage from '$lib/components/developer/FormMessage.svelte';
	import PermissionButton from '$lib/components/developer/PermissionButton.svelte';
	import type { FormFailureData } from '$lib/developer/formErrors';
	import ImageIcon from 'phosphor-svelte/lib/ImageIcon';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const failure = $derived(form as FormFailureData | null);
	const canEdit = $derived(data.app.myPermissions.includes('apps.edit'));
</script>

<WidgetCard title="Logo" subtitle="Shown to users on the consent screen. PNG or SVG." icon={ImageIcon}>
	<div class="flex max-w-2xl flex-col gap-4 p-4">
		{#if data.app.logoUrl !== null}
			<img src={data.app.logoUrl} alt="{data.app.name} logo" class="size-20 rounded-xl border border-line bg-raised object-contain" />
			{#if data.app.logoHeld}
				<p class="rounded-lg bg-raised px-3 py-2 text-sm text-muted" data-testid="logo-held">
					This logo resembles the logo of another app. Users see your app's initials until Neoworks approves the app.
				</p>
			{/if}
		{:else}
			<p class="text-sm text-dim">No logo uploaded.</p>
		{/if}

		<FormMessage form={failure} name="upload" />
		<FormMessage form={failure} name="remove" />

		<form method="POST" action="?/upload" enctype="multipart/form-data" use:enhance class="flex flex-wrap items-center gap-3">
			<input
				type="file"
				name="logo"
				accept="image/png,image/svg+xml"
				disabled={!canEdit}
				aria-label="Logo file"
				class="text-sm text-muted file:mr-3 file:rounded-md file:border file:border-line file:bg-raised file:px-3 file:py-1.5 file:text-xs file:text-default"
			/>
			<PermissionButton allowed={canEdit} permission="apps.edit" variant="primary">Upload logo</PermissionButton>
		</form>

		{#if data.app.logoUrl !== null}
			<form method="POST" action="?/remove" use:enhance>
				<PermissionButton allowed={canEdit} permission="apps.edit" variant="danger">Remove logo</PermissionButton>
			</form>
		{/if}
	</div>
</WidgetCard>

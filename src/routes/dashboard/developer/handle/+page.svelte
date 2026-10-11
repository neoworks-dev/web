<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '@neoworks-dev/ui';
	import PageHeader from '$lib/components/dashboard/PageHeader.svelte';
	import WidgetCard from '$lib/components/dashboard/WidgetCard.svelte';
	import HandleField from '$lib/components/developer/HandleField.svelte';
	import FormMessage from '$lib/components/developer/FormMessage.svelte';
	import { fieldError, type FormFailureData } from '$lib/developer/formErrors';
	import AtIcon from 'phosphor-svelte/lib/AtIcon';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	const failure = $derived(form as FormFailureData | null);
	let handle = $state('');
</script>

<svelte:head>
	<title>Pick a handle — NeoWorks</title>
</svelte:head>

<div class="h-full space-y-2 overflow-y-auto">
	<PageHeader
		title="Pick your handle"
		subtitle="You need a handle before you can register apps, publish schemas or create organizations."
	/>

	<WidgetCard title="Your handle" subtitle="It becomes your scope, for example @{handle || 'you'}/notes." icon={AtIcon}>
		<form method="POST" action="?/claim" use:enhance class="flex max-w-md flex-col gap-4 p-4">
			<HandleField bind:value={handle} error={fieldError(failure, 'claim', 'handle')} />
			<p class="rounded-lg bg-amber-soft px-3 py-2 text-xs text-amber">
				A handle is permanent. It cannot be renamed or released, even if you delete your account, because
				collection paths like @{handle || 'you'}/notes are stored in your encrypted data.
			</p>
			<FormMessage form={failure} name="claim" fields={['handle']} />
			<div>
				<Button type="submit" variant="primary">Claim handle permanently</Button>
			</div>
		</form>
	</WidgetCard>
</div>

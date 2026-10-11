<script lang="ts">
	import { untrack } from 'svelte';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { Grant, Member } from '@neoworks-dev/platform';
	import { Button, StatusBadge } from '@neoworks-dev/ui';
	import { describeGrant } from '$lib/developer/permissions';
	import type { FormFailureData } from '$lib/developer/formErrors';
	import FormMessage from './FormMessage.svelte';
	import GrantEditor from './GrantEditor.svelte';
	import PermissionButton from './PermissionButton.svelte';

	let {
		member,
		apps,
		callerGrants,
		canManage,
		isSelf,
		form,
	}: {
		member: Member;
		apps: { id: string; name: string }[];
		callerGrants: Grant[];
		canManage: boolean;
		isSelf: boolean;
		form: FormFailureData | null;
	} = $props();

	let editing = $state(false);
	let draftGrants = $state<Grant[]>(untrack(() => member.grants.map((grant) => ({ ...grant }))));

	const appNames = $derived(Object.fromEntries(apps.map((app) => [app.id, app.name])));

	function startEditing() {
		draftGrants = member.grants.map((grant) => ({ ...grant }));
		editing = true;
	}

	const closeWhenSaved: SubmitFunction = () => {
		return async ({ result, update }) => {
			await update({ reset: false });
			if (result.type === 'success') {
				editing = false;
			}
		};
	};
</script>

<div class="flex flex-col gap-3 rounded-lg bg-raised p-4" data-testid="member-{member.userId}">
	<div class="flex flex-wrap items-center justify-between gap-2">
		<div class="min-w-0">
			<p class="flex items-center gap-2 text-sm font-medium text-default">
				{member.displayName}
				{#if isSelf}
					<StatusBadge tone="blue">You</StatusBadge>
				{/if}
			</p>
			<p class="text-xs text-dim">{member.email}</p>
		</div>
		<div class="flex flex-wrap items-center gap-2">
			<PermissionButton allowed={canManage} permission="members.manage" type="button" onclick={startEditing}>
				Edit permissions
			</PermissionButton>
			{#if isSelf}
				<form method="POST" action="?/leave" use:enhance>
					<input type="hidden" name="userId" value={member.userId} />
					<Button type="submit" variant="danger" size="sm">Leave</Button>
				</form>
			{:else}
				<form method="POST" action="?/remove" use:enhance>
					<input type="hidden" name="userId" value={member.userId} />
					<PermissionButton allowed={canManage} permission="members.manage" variant="danger">Remove</PermissionButton>
				</form>
			{/if}
		</div>
	</div>

	{#if !editing}
		<ul class="flex flex-wrap gap-1.5">
			{#each member.grants as grant (`${grant.permission}-${grant.appId}`)}
				<li class="rounded-full bg-elevated px-2 py-0.5 font-mono text-2xs text-muted">{describeGrant(grant, appNames)}</li>
			{/each}
			{#if member.grants.length === 0}
				<li class="text-xs text-dim">No permissions</li>
			{/if}
		</ul>
	{:else}
		<form method="POST" action="?/setGrants" use:enhance={closeWhenSaved} class="flex flex-col gap-3">
			<input type="hidden" name="userId" value={member.userId} />
			<GrantEditor bind:grants={draftGrants} {apps} {callerGrants} />
			<div class="flex gap-2">
				<Button type="submit" variant="primary" size="sm">Save permissions</Button>
				<Button variant="ghost" size="sm" onclick={() => (editing = false)}>Cancel</Button>
			</div>
		</form>
	{/if}

	<FormMessage form={form} name="grants-{member.userId}" />
	<FormMessage form={form} name="remove-{member.userId}" />
	{#if isSelf}
		<FormMessage form={form} name="leave" />
	{/if}
</div>

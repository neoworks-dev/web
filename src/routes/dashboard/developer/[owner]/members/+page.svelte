<script lang="ts">
	import { enhance } from '$app/forms';
	import { StatusBadge } from '@neoworks-dev/ui';
	import type { Grant } from '@neoworks-dev/sdk';
	import PageHeader from '$lib/components/dashboard/PageHeader.svelte';
	import WidgetCard from '$lib/components/dashboard/WidgetCard.svelte';
	import FormMessage from '$lib/components/developer/FormMessage.svelte';
	import GrantEditor from '$lib/components/developer/GrantEditor.svelte';
	import MemberRow from '$lib/components/developer/MemberRow.svelte';
	import PermissionButton from '$lib/components/developer/PermissionButton.svelte';
	import TextField from '$lib/components/developer/TextField.svelte';
	import { fieldError, type FormFailureData } from '$lib/developer/formErrors';
	import { describeGrant, holdsPermission, presetGrants } from '$lib/developer/permissions';
	import EnvelopeSimpleIcon from 'phosphor-svelte/lib/EnvelopeSimpleIcon';
	import UsersThreeIcon from 'phosphor-svelte/lib/UsersThreeIcon';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const failure = $derived(form as FormFailureData | null);
	const canManage = $derived(holdsPermission(data.grants, 'members.manage'));
	const ownHandle = $derived(data.developer?.handle);
	const appNames = $derived(Object.fromEntries(data.apps.map((app) => [app.id, app.name])));

	function inviteeLabel(invitation: { email?: string; contactCode?: string }): string {
		if (invitation.email !== undefined) {
			return invitation.email;
		}
		return String(invitation.contactCode);
	}

	let inviteEmail = $state('');
	let inviteContactCode = $state('');
	let inviteGrants = $state<Grant[]>(presetGrants('viewer'));
</script>

<svelte:head>
	<title>Members — NeoWorks</title>
</svelte:head>

<div class="h-full space-y-2 overflow-y-auto">
	<PageHeader title="Members" subtitle="Permissions are granted organization-wide or for a single app." />

	{#if data.organization === null}
		<p class="rounded-xl border border-line-faint bg-elevated p-5 text-sm text-dim">
			Personal accounts have no members. Create an organization to collaborate.
		</p>
	{:else}
		<WidgetCard title="Members" icon={UsersThreeIcon}>
			<div class="flex flex-col gap-3 p-4">
				{#each data.members as member (member.userId)}
					<MemberRow
						{member}
						apps={data.apps}
						callerGrants={data.grants}
						{canManage}
						isSelf={member.handle === ownHandle}
						form={failure}
					/>
				{/each}
			</div>
		</WidgetCard>

		<WidgetCard title="Invite a member" subtitle="By email or contact code. The invitee needs an account and must accept." icon={EnvelopeSimpleIcon}>
			<form method="POST" action="?/invite" use:enhance class="flex max-w-2xl flex-col gap-4 p-4">
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<TextField
						label="Email"
						name="email"
						type="email"
						bind:value={inviteEmail}
						disabled={!canManage}
						error={fieldError(failure, 'invite', 'email')}
					/>
					<TextField
						label="Contact code"
						name="contactCode"
						bind:value={inviteContactCode}
						disabled={!canManage}
						error={fieldError(failure, 'invite', 'contactCode')}
					/>
				</div>
				<GrantEditor bind:grants={inviteGrants} apps={data.apps} callerGrants={data.grants} disabled={!canManage} />
				<FormMessage form={failure} name="invite" fields={['email', 'contactCode']} />
				<div>
					<PermissionButton allowed={canManage} permission="members.manage" variant="primary">Send invitation</PermissionButton>
				</div>
			</form>
		</WidgetCard>

		{#if canManage}
			<WidgetCard title="Pending invitations" icon={EnvelopeSimpleIcon}>
				<div class="flex flex-col gap-2 p-4">
					<FormMessage form={failure} name="revoke" />
					{#if data.invitations.length === 0}
						<p class="text-sm text-dim">No pending invitations.</p>
					{/if}
					{#each data.invitations as invitation (invitation.id)}
						<div class="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-raised px-4 py-3" data-testid="pending-{invitation.id}">
							<div class="min-w-0">
								<p class="text-sm text-default">{inviteeLabel(invitation)}</p>
								<p class="text-xs text-dim">
									{invitation.grants.map((grant) => describeGrant(grant, appNames)).join(', ')}
								</p>
							</div>
							<div class="flex items-center gap-2">
								<StatusBadge tone="amber">Pending</StatusBadge>
								<form method="POST" action="?/revokeInvitation" use:enhance>
									<input type="hidden" name="invitationId" value={invitation.id} />
									<PermissionButton allowed={canManage} permission="members.manage" variant="ghost">Revoke</PermissionButton>
								</form>
							</div>
						</div>
					{/each}
				</div>
			</WidgetCard>
		{/if}
	{/if}
</div>

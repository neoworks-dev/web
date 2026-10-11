<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '@neoworks-dev/ui';
	import PageHeader from '$lib/components/dashboard/PageHeader.svelte';
	import WidgetCard from '$lib/components/dashboard/WidgetCard.svelte';
	import FormMessage from '$lib/components/developer/FormMessage.svelte';
	import { describeGrant } from '$lib/developer/permissions';
	import type { FormFailureData } from '$lib/developer/formErrors';
	import EnvelopeSimpleIcon from 'phosphor-svelte/lib/EnvelopeSimpleIcon';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const failure = $derived(form as FormFailureData | null);
</script>

<svelte:head>
	<title>Invitations — NeoWorks</title>
</svelte:head>

<div class="h-full space-y-2 overflow-y-auto">
	<PageHeader title="Invitations" subtitle="Organizations that invited you. Accepting gives you the listed permissions." />

	<WidgetCard title="Pending invitations" icon={EnvelopeSimpleIcon}>
		<div class="flex flex-col gap-3 p-4">
			<FormMessage form={failure} name="invitation" />
			{#if data.invitations.length === 0}
				<p class="text-sm text-dim">No pending invitations.</p>
			{/if}
			{#each data.invitations as invitation (invitation.id)}
				<div class="flex flex-col gap-3 rounded-lg bg-raised p-4" data-testid="invitation-{invitation.organization.handle}">
					<div>
						<p class="text-sm font-medium text-default">{invitation.organization.displayName}</p>
						<p class="text-xs text-dim">
							@{invitation.organization.handle} · invited by {invitation.invitedBy.displayName} · expires
							{new Date(invitation.expiresAt).toLocaleDateString()}
						</p>
					</div>
					<ul class="flex flex-wrap gap-1.5">
						{#each invitation.grants as grant (`${grant.permission}-${grant.appId}`)}
							<li class="rounded-full bg-elevated px-2 py-0.5 font-mono text-2xs text-muted">
								{describeGrant(grant, {})}
							</li>
						{/each}
					</ul>
					<div class="flex gap-2">
						<form method="POST" action="?/accept" use:enhance>
							<input type="hidden" name="invitationId" value={invitation.id} />
							<Button type="submit" variant="primary" size="sm">Accept</Button>
						</form>
						<form method="POST" action="?/decline" use:enhance>
							<input type="hidden" name="invitationId" value={invitation.id} />
							<Button type="submit" variant="ghost" size="sm">Decline</Button>
						</form>
					</div>
				</div>
			{/each}
		</div>
	</WidgetCard>
</div>

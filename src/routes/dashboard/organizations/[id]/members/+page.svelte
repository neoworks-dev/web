<script lang="ts">
	import { page } from '$app/stores';
	import { sdk } from '$lib/sdk';
	import type { OrganizationMember, OrgInvite } from '@neoworks-dev/sdk';
	import PlusIcon from 'phosphor-svelte/lib/PlusIcon';
	import TrashIcon from 'phosphor-svelte/lib/TrashIcon';
	import EnvelopeIcon from 'phosphor-svelte/lib/EnvelopeIcon';
	import UsersIcon from 'phosphor-svelte/lib/UsersIcon';
	import PageHeader from '$lib/components/dashboard/PageHeader.svelte';
	import WidgetCard from '$lib/components/dashboard/WidgetCard.svelte';

	const orgId = $derived($page.params.id ?? "");

	let members = $state<OrganizationMember[]>([]);
	let invites = $state<OrgInvite[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	let inviteEmail = $state('');
	let inviteRole = $state('member');
	let inviting = $state(false);

	$effect(() => {
		const id = orgId;
		loading = true;
		Promise.all([sdk.organizations.members(id), sdk.organizations.invites(id)])
			.then(([m, i]) => {
				if (orgId !== id) return;
				members = m;
				invites = i;
				loading = false;
			})
			.catch((e) => {
				error = e?.message ?? 'Failed to load members';
				loading = false;
			});
	});

	async function sendInvite() {
		if (!inviteEmail.trim()) return;
		inviting = true;
		error = null;
		try {
			const invite = await sdk.organizations.createInvite(orgId, inviteEmail.trim(), inviteRole);
			invites = [invite, ...invites];
			inviteEmail = '';
		} catch (e: any) {
			error = e?.message ?? 'Could not send invite';
		} finally {
			inviting = false;
		}
	}

	async function revoke(invite: OrgInvite) {
		await sdk.organizations.revokeInvite(invite.id);
		invites = invites.filter((i) => i.id !== invite.id);
	}

	async function remove(member: OrganizationMember) {
		await sdk.organizations.removeMember(orgId, member.user_id);
		members = members.filter((m) => m.user_id !== member.user_id);
	}
</script>

<svelte:head>
	<title>Members — NeoWorks</title>
</svelte:head>

<div class="h-full overflow-y-auto space-y-2">
	<PageHeader title="Members" subtitle="People with access to this organization." />

	<!-- Invite form -->
	<WidgetCard title="Invite a teammate" subtitle="Send an invite by email to add a member." icon={EnvelopeIcon}>
		<div class="p-4 space-y-3">
		<div class="flex flex-col sm:flex-row sm:items-center gap-2">
			<input
				bind:value={inviteEmail}
				placeholder="teammate@acme.com"
				class="flex-1 h-9 px-3 rounded-lg border border-line bg-surface text-[13px] text-default placeholder:text-dim focus:outline-none focus:border-primary transition-colors"
			/>
			<div class="flex gap-2">
				<select
					bind:value={inviteRole}
					class="flex-1 sm:flex-none h-9 px-2 rounded-lg border border-line bg-surface text-[13px] text-default focus:outline-none focus:border-primary transition-colors"
				>
					<option value="member">Member</option>
					<option value="admin">Admin</option>
					<option value="billing">Billing</option>
					<option value="owner">Owner</option>
				</select>
				<button
					class="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-primary-content text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
					onclick={sendInvite}
					disabled={inviting}
				>
					<PlusIcon size={14} />
					Invite
				</button>
			</div>
		</div>
		{#if error}<p class="text-[12px] text-red">{error}</p>{/if}
		</div>
	</WidgetCard>

	<WidgetCard title="Members" subtitle="Members and pending invites for this organization." icon={UsersIcon}>
		<div class="p-4 space-y-4">
	{#if loading}
		<div class="space-y-2">
			{#each { length: 3 } as _}<div class="skeleton h-12 w-full rounded-lg"></div>{/each}
		</div>
	{:else}
		<!-- Members -->
		<div class="space-y-2">
			<p class="text-[11px] font-medium text-dim uppercase tracking-caps">Members ({members.length})</p>
			{#each members as member (member.user_id)}
				<div class="flex items-center justify-between rounded-lg border border-line-faint bg-surface px-4 py-3">
					<div class="min-w-0">
						<p class="text-[13px] font-medium text-default truncate">{member.name || member.email || member.user_id}</p>
						<p class="text-[12px] text-dim capitalize">
							{member.role}{#if member.name && member.email} · <span class="normal-case">{member.email}</span>{/if}
						</p>
					</div>
					{#if member.role !== 'owner'}
						<button class="flex items-center gap-1.5 h-7 px-2.5 rounded text-[12px] text-dim hover:text-red hover:bg-red-soft transition-colors" onclick={() => remove(member)}>
							<TrashIcon size={13} /> Remove
						</button>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Pending invites -->
		{#if invites.length > 0}
			<div class="space-y-2">
				<p class="text-[11px] font-medium text-dim uppercase tracking-caps">Pending invites ({invites.length})</p>
				{#each invites as invite (invite.id)}
					<div class="flex items-center justify-between rounded-lg border border-line-faint bg-surface px-4 py-3">
						<div class="flex items-center gap-2.5 min-w-0">
							<EnvelopeIcon size={16} class="text-dim shrink-0" />
							<div class="min-w-0">
								<p class="text-[13px] text-default truncate">{invite.email}</p>
								<p class="text-[12px] text-dim capitalize">{invite.role} · pending</p>
							</div>
						</div>
						<button class="flex items-center gap-1.5 h-7 px-2.5 rounded text-[12px] text-dim hover:text-red hover:bg-red-soft transition-colors" onclick={() => revoke(invite)}>
							<TrashIcon size={13} /> Revoke
						</button>
					</div>
				{/each}
			</div>
		{/if}
	{/if}
		</div>
	</WidgetCard>
</div>

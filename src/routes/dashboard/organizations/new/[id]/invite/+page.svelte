<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { sdk } from '$lib/sdk';
	import { isValidEmail } from '$lib/organizations';
	import type { OrgInvite } from '@neoworks-dev/sdk';
	import PlusIcon from 'phosphor-svelte/lib/PlusIcon';
	import TrashIcon from 'phosphor-svelte/lib/TrashIcon';
	import EnvelopeIcon from 'phosphor-svelte/lib/EnvelopeIcon';

	const orgId = $derived($page.params.id ?? '');

	let invites = $state<OrgInvite[]>([]);
	let loading = $state(true);

	let inviteEmail = $state('');
	let inviteRole = $state('member');
	let inviting = $state(false);
	let error = $state<string | null>(null);

	$effect(() => {
		const id = orgId;
		loading = true;
		sdk.organizations
			.invites(id)
			.then((res) => {
				if (orgId !== id) return;
				invites = res;
				loading = false;
			})
			.catch((e) => {
				error = e?.message ?? 'Failed to load invites';
				loading = false;
			});
	});

	async function sendInvite() {
		const email = inviteEmail.trim();
		if (!email) return;
		if (!isValidEmail(email)) {
			error = 'Enter a valid email address.';
			return;
		}
		inviting = true;
		error = null;
		try {
			const invite = await sdk.organizations.createInvite(orgId, email, inviteRole);
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

	function toBilling() {
		goto(`/dashboard/organizations/new/${orgId}/billing`);
	}
</script>

<svelte:head>
	<title>New organization · Invite — NeoWorks</title>
</svelte:head>

<div class="space-y-5">
	<div>
		<h2 class="text-[15px] font-semibold text-default">Invite your team</h2>
		<p class="text-[13px] text-dim mt-0.5">
			Invite teammates by email. They'll get a link to join. You can always do this later.
		</p>
	</div>

	<div class="flex flex-col sm:flex-row sm:items-center gap-2">
		<input
			bind:value={inviteEmail}
			placeholder="teammate@acme.com"
			onkeydown={(e) => e.key === 'Enter' && sendInvite()}
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

	{#if loading}
		<div class="space-y-2">
			{#each { length: 2 } as _}<div class="skeleton h-12 w-full rounded-lg"></div>{/each}
		</div>
	{:else if invites.length > 0}
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
					<button
						class="flex items-center gap-1.5 h-7 px-2.5 rounded text-[12px] text-dim hover:text-red hover:bg-red-soft transition-colors"
						onclick={() => revoke(invite)}
					>
						<TrashIcon size={13} /> Revoke
					</button>
				</div>
			{/each}
		</div>
	{/if}

	<div class="flex items-center justify-between gap-3 pt-2 border-t border-line-faint">
		<button
			class="h-9 px-4 rounded-lg text-[13px] text-muted hover:text-default transition-colors"
			onclick={toBilling}
		>Skip for now</button>
		<button
			class="h-9 px-4 rounded-lg bg-primary text-primary-content text-[13px] font-medium hover:opacity-90 transition-opacity"
			onclick={toBilling}
		>Continue</button>
	</div>
</div>

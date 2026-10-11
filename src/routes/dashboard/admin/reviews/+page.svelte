<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, StatusBadge } from '@neoworks-dev/ui';
	import PageHeader from '$lib/components/dashboard/PageHeader.svelte';
	import WidgetCard from '$lib/components/dashboard/WidgetCard.svelte';
	import FormMessage from '$lib/components/developer/FormMessage.svelte';
	import TextField from '$lib/components/developer/TextField.svelte';
	import type { FormFailureData } from '$lib/developer/formErrors';
	import { reviewLabel, reviewTone } from '$lib/developer/status';
	import SealCheckIcon from 'phosphor-svelte/lib/SealCheckIcon';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const failure = $derived(form as FormFailureData | null);

	function ariaCurrent(status: string): 'page' | undefined {
		if (data.status === status) {
			return 'page';
		}
		return undefined;
	}
</script>

<svelte:head>
	<title>App reviews — NeoWorks</title>
</svelte:head>

<div class="h-full space-y-2 overflow-y-auto">
	<PageHeader
		title="App reviews"
		subtitle="Approve, reject or suspend third-party apps. Suspending stops new authorizations and token refreshes."
	/>

	<nav aria-label="Review status" class="flex flex-wrap gap-1 rounded-xl border border-line-faint bg-elevated p-1">
		{#each data.statuses as status (status)}
			<a
				href="?status={status}"
				aria-current={ariaCurrent(status)}
				class="rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors hover:text-default"
				class:bg-raised={data.status === status}
				class:text-default={data.status === status}
				class:text-muted={data.status !== status}
			>
				{reviewLabel(status)}
			</a>
		{/each}
	</nav>

	<WidgetCard title={reviewLabel(data.status)} icon={SealCheckIcon}>
		{#if data.items.length === 0}
			<p class="p-4 text-sm text-dim">No apps in this status.</p>
		{/if}
		<ul class="divide-y divide-line-faint">
			{#each data.items as item (item.app.id)}
				<li class="flex flex-col gap-3 p-4" data-testid="review-{item.app.id}">
					<div class="flex flex-wrap items-center gap-2">
						<span class="text-sm font-medium text-default">{item.app.name}</span>
						<span class="font-mono text-xs text-dim">{item.app.id}</span>
						<StatusBadge tone={reviewTone(item.app.review.status)}>{reviewLabel(item.app.review.status)}</StatusBadge>
						{#if item.app.owner.verified}
							<StatusBadge tone="green">Verified organization</StatusBadge>
						{/if}
					</div>
					<p class="text-sm text-muted">
						{item.app.owner.displayName} (@{item.app.owner.handle}) · {item.app.description}
					</p>
					<dl class="grid grid-cols-1 gap-1 text-xs text-muted md:grid-cols-2">
						<div><dt class="inline text-dim">Homepage: </dt><dd class="inline">{item.app.homepage}</dd></div>
						<div><dt class="inline text-dim">Privacy policy: </dt><dd class="inline">{item.privacyPolicyUrl}</dd></div>
						<div><dt class="inline text-dim">Support: </dt><dd class="inline">{item.supportContact}</dd></div>
						<div><dt class="inline text-dim">Redirect URIs: </dt><dd class="inline">{item.app.redirectUris.join(', ')}</dd></div>
					</dl>
					<ul class="text-xs text-muted">
						{#each item.scopes as scope (scope.scope)}
							<li><span class="font-mono text-default">{scope.scope}</span> — {scope.reason}</li>
						{/each}
					</ul>
					{#if item.app.logoHeld}
						<p class="rounded-lg bg-raised px-3 py-2 text-xs text-muted">The logo resembles the logo of another app.</p>
					{/if}
					{#if item.app.review.reason !== null}
						<p class="rounded-lg bg-raised px-3 py-2 text-xs text-muted">Reason: {item.app.review.reason}</p>
					{/if}

					<FormMessage form={failure} name="approve-{item.app.id}" />
					<FormMessage form={failure} name="reject-{item.app.id}" />
					<FormMessage form={failure} name="suspend-{item.app.id}" />
					<div class="flex flex-wrap items-end gap-2">
						{#if item.app.review.status === 'pending' || item.app.review.status === 'suspended'}
							<form method="POST" action="?/approve" use:enhance>
								<input type="hidden" name="clientId" value={item.app.id} />
								<Button type="submit" variant="success" size="sm">
									{#if item.app.review.status === 'suspended'}Lift suspension{:else}Approve{/if}
								</Button>
							</form>
						{/if}
						{#if item.app.review.status === 'pending'}
							<form method="POST" action="?/reject" use:enhance class="flex items-end gap-2">
								<input type="hidden" name="clientId" value={item.app.id} />
								<TextField label="Reason to reject" name="reason" placeholder="What the developer should fix" />
								<Button type="submit" variant="danger" size="sm">Reject</Button>
							</form>
						{/if}
						{#if item.app.review.status !== 'suspended'}
							<form method="POST" action="?/suspend" use:enhance class="flex items-end gap-2">
								<input type="hidden" name="clientId" value={item.app.id} />
								<TextField label="Reason to suspend" name="reason" placeholder="Why the app is suspended" />
								<Button type="submit" variant="danger" size="sm">Suspend</Button>
							</form>
						{/if}
					</div>

					<div class="flex flex-wrap items-end gap-2">
						{#if item.app.owner.kind === 'organization'}
							<form method="POST" action="?/verifyOrganization" use:enhance>
								<input type="hidden" name="handle" value={item.app.owner.handle} />
								<input type="hidden" name="verified" value={String(!item.app.owner.verified)} />
								<Button type="submit" variant="surface" size="sm">
									{#if item.app.owner.verified}Withdraw organization verification{:else}Verify organization{/if}
								</Button>
							</form>
						{/if}
						<form method="POST" action="?/rateLimit" use:enhance class="flex items-end gap-2">
							<input type="hidden" name="clientId" value={item.app.id} />
							<TextField label="Rate limit multiplier" name="multiplier" placeholder="empty = by standing" />
							<Button type="submit" variant="surface" size="sm">Set</Button>
						</form>
					</div>
					<FormMessage form={failure} name="verify-{item.app.owner.handle}" />
					<FormMessage form={failure} name="limit-{item.app.id}" />
				</li>
			{/each}
		</ul>
	</WidgetCard>
</div>

<script lang="ts">
	import { enhance } from '$app/forms';
	import { StatusBadge } from '@neoworks-dev/ui';
	import PageHeader from '$lib/components/dashboard/PageHeader.svelte';
	import WidgetCard from '$lib/components/dashboard/WidgetCard.svelte';
	import FormMessage from '$lib/components/developer/FormMessage.svelte';
	import PermissionButton from '$lib/components/developer/PermissionButton.svelte';
	import TextField from '$lib/components/developer/TextField.svelte';
	import { fieldError, type FormFailureData } from '$lib/developer/formErrors';
	import { holdsPermission } from '$lib/developer/permissions';
	import GlobeIcon from 'phosphor-svelte/lib/GlobeIcon';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const failure = $derived(form as FormFailureData | null);
	const canManage = $derived(holdsPermission(data.grants, 'domains.manage'));
	const verifyFailed = $derived.by(() => {
		if (form === null || form === undefined || !('passed' in form)) {
			return null;
		}
		if (form.passed) {
			return null;
		}
		return form.verified;
	});
	let domain = $state('');
	let method = $state('dns');
</script>

<svelte:head>
	<title>Domains — NeoWorks</title>
</svelte:head>

<div class="h-full space-y-2 overflow-y-auto">
	<PageHeader
		title="Domains"
		subtitle="Prove you control a domain to mark @{data.owner.handle} and its apps as verified."
	/>

	<WidgetCard title="Add a domain" icon={GlobeIcon}>
		<form method="POST" action="?/add" use:enhance class="flex max-w-xl flex-col gap-4 p-4">
			<TextField
				label="Domain"
				name="domain"
				bind:value={domain}
				placeholder="example.com"
				disabled={!canManage}
				error={fieldError(failure, 'add', 'domain')}
			/>
			<fieldset class="flex flex-col gap-2">
				<legend class="text-xs font-medium text-muted">Verification method</legend>
				<label class="flex items-center gap-2 text-sm text-default">
					<input type="radio" name="method" value="dns" bind:group={method} disabled={!canManage} />
					DNS TXT record
				</label>
				<label class="flex items-center gap-2 text-sm text-default">
					<input type="radio" name="method" value="wellKnown" bind:group={method} disabled={!canManage} />
					File under /.well-known/
				</label>
			</fieldset>
			<FormMessage form={failure} name="add" fields={['domain']} />
			<div>
				<PermissionButton allowed={canManage} permission="domains.manage" variant="primary">Add domain</PermissionButton>
			</div>
		</form>
	</WidgetCard>

	<WidgetCard title="Your domains" icon={GlobeIcon}>
		{#if data.domains.length === 0}
			<p class="p-4 text-sm text-dim">No domains yet.</p>
		{/if}
		<ul class="divide-y divide-line-faint">
			{#each data.domains as entry (entry.domain)}
				<li class="flex flex-col gap-3 p-4" data-testid="domain-{entry.domain}">
					<div class="flex flex-wrap items-center gap-2">
						<span class="text-sm font-medium text-default">{entry.domain}</span>
						{#if entry.verified}
							<StatusBadge tone="green">Verified</StatusBadge>
						{:else}
							<StatusBadge tone="amber">Not verified</StatusBadge>
						{/if}
					</div>

					{#if !entry.verified}
						<div class="rounded-lg bg-raised p-3 text-xs text-muted">
							{#if entry.method === 'dns'}
								<p>Add a DNS TXT record on <code class="font-mono text-default">{entry.domain}</code> with this value:</p>
							{:else}
								<p>
									Serve a file at
									<code class="font-mono text-default">https://{entry.domain}/.well-known/neoworks-verification.txt</code>
									containing:
								</p>
							{/if}
							<code class="mt-1 block break-all font-mono text-default" data-testid="verification-token">{entry.token}</code>
							{#if entry.lastCheckedAt !== null}
								<p class="mt-2 text-dim">Last checked {new Date(entry.lastCheckedAt).toLocaleString()}</p>
							{/if}
						</div>
					{/if}

					{#if verifyFailed === entry.domain}
						<p class="text-sm text-red" role="alert">Could not find the proof for {entry.domain} yet. Check the record and try again.</p>
					{/if}
					<FormMessage form={failure} name="verify-{entry.domain}" />
					<FormMessage form={failure} name="remove-{entry.domain}" />

					<div class="flex gap-2">
						{#if !entry.verified}
							<form method="POST" action="?/verify" use:enhance>
								<input type="hidden" name="domain" value={entry.domain} />
								<PermissionButton allowed={canManage} permission="domains.manage" variant="primary">Verify</PermissionButton>
							</form>
						{/if}
						<form method="POST" action="?/remove" use:enhance>
							<input type="hidden" name="domain" value={entry.domain} />
							<PermissionButton allowed={canManage} permission="domains.manage" variant="danger">Remove</PermissionButton>
						</form>
					</div>
				</li>
			{/each}
		</ul>
	</WidgetCard>
</div>

<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, StatusBadge } from '@neoworks-dev/ui';
	import type { ConnectedApp } from '@neoworks-dev/platform';
	import PageHeader from '$lib/components/dashboard/PageHeader.svelte';
	import WidgetCard from '$lib/components/dashboard/WidgetCard.svelte';
	import FormMessage from '$lib/components/developer/FormMessage.svelte';
	import TextField from '$lib/components/developer/TextField.svelte';
	import { colourFor, initialsOf } from '$lib/developer/appIdentity';
	import { formatBytes } from '$lib/developer/appFields';
	import { keepFormValues } from '$lib/developer/enhance';
	import { fieldError, type FormFailureData } from '$lib/developer/formErrors';
	import PlugsConnectedIcon from 'phosphor-svelte/lib/PlugsConnectedIcon';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const failure = $derived(form as FormFailureData | null);

	const cappedClientId = $derived.by(() => {
		if (form === null || form === undefined || !('capped' in form)) {
			return '';
		}
		return form.capped;
	});

	function activeInstalls(app: ConnectedApp) {
		return app.installs.filter((install) => install.revokedAt === null);
	}

	function installName(name: string | null, clientId: string): string {
		if (name === null) {
			return clientId;
		}
		return name;
	}

	function capInMegabytes(app: ConnectedApp): string {
		if (app.storage.capBytes === null) {
			return '';
		}
		return String(Math.round(app.storage.capBytes / (1024 * 1024)));
	}
</script>

<svelte:head>
	<title>Connected Apps — NeoWorks</title>
</svelte:head>

<div class="h-full overflow-y-auto space-y-2">
	<PageHeader
		title="Connected Apps"
		subtitle="Apps that can access parts of your account. Revoking blocks an app immediately; its keys are rotated the next time you open your vault."
	/>

	<WidgetCard title="Storage" subtitle="Node content and files of all your apps count against your quota." icon={PlugsConnectedIcon}>
		<p class="p-4 text-sm text-default" data-testid="storage-total">
			{formatBytes(data.storage.usedBytes)} of {formatBytes(data.storage.quotaBytes)} used
		</p>
	</WidgetCard>

	<WidgetCard title="Apps" subtitle="Apps you have authorized." icon={PlugsConnectedIcon}>
		<FormMessage form={failure} name="revoke" />
		{#if data.apps.length === 0}
			<p class="p-5 text-sm text-dim">No apps are connected.</p>
		{:else}
			<ul class="divide-y divide-line-faint">
				{#each data.apps as app (app.clientId)}
					<li class="flex flex-col gap-3 px-4 py-4" data-testid="app-{app.clientId}">
						<div class="flex items-center gap-3">
							{#if app.logoUrl !== null}
								<img src={app.logoUrl} alt="" class="size-10 rounded-lg border border-line bg-raised object-contain" />
							{:else}
								<span
									class="flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white"
									style="background-color: {colourFor(app.clientId)}"
									data-testid="initials">{initialsOf(app.name)}</span
								>
							{/if}
							<div class="min-w-0 flex-1">
								<p class="truncate text-sm font-medium text-default">{app.name}</p>
								<p class="truncate text-xs text-dim" data-testid="owner">
									{#if app.owner !== null}
										by {app.owner.displayName} (@{app.owner.handle})
									{:else}
										Publisher unknown
									{/if}
								</p>
							</div>
							<div class="flex flex-wrap items-center gap-1.5">
								{#if app.firstParty}
									<StatusBadge tone="blue">Made by Neoworks</StatusBadge>
								{:else if app.verified}
									<StatusBadge tone="green">Verified by {app.owner?.displayName}</StatusBadge>
								{:else}
									<StatusBadge tone="amber">Unverified</StatusBadge>
								{/if}
								{#if app.owner !== null && app.owner.verified && !app.firstParty}
									<StatusBadge tone="green">Verified organization</StatusBadge>
								{/if}
								{#if app.reviewStatus === 'approved' && !app.firstParty}
									<StatusBadge tone="green">Reviewed</StatusBadge>
								{/if}
								{#if app.reviewStatus === 'suspended'}
									<StatusBadge tone="red">Suspended</StatusBadge>
								{/if}
							</div>
						</div>

						{#if app.reviewStatus === 'suspended'}
							<p class="rounded-lg bg-red-soft px-3 py-2 text-sm text-red" role="alert">
								Neoworks suspended this app{#if app.reviewReason !== null}: {app.reviewReason}{/if}. It cannot sign anyone in or refresh its access.
							</p>
						{/if}

						<p class="text-xs text-muted">{app.scopes.join(', ')}</p>

						<ul class="flex flex-col gap-1">
							{#each activeInstalls(app) as install (install.id)}
								<li class="flex items-center gap-3 text-xs text-muted">
									<span class="flex-1">
										{installName(install.name, app.clientId)} · connected {new Date(install.createdAt).toLocaleDateString()}
									</span>
									<form method="POST" action="?/revoke" use:enhance>
										<input type="hidden" name="installId" value={install.id} />
										<Button type="submit" variant="danger" size="sm">Revoke</Button>
									</form>
								</li>
							{/each}
						</ul>

						<form method="POST" action="?/cap" use:enhance={keepFormValues} class="flex flex-wrap items-end gap-2">
							<input type="hidden" name="clientId" value={app.clientId} />
							<TextField
								label="Storage cap (MB, empty for none)"
								name="capMegabytes"
								value={capInMegabytes(app)}
								hint="Uses {formatBytes(app.storage.usedBytes)} now"
								error={fieldError(failure, `cap-${app.clientId}`, 'capMegabytes')}
							/>
							<Button type="submit" variant="surface" size="sm">Set cap</Button>
						</form>
						<FormMessage form={failure} name="cap-{app.clientId}" fields={['capMegabytes']} />
						{#if cappedClientId === app.clientId}
							<p class="text-xs text-green" role="status">Storage cap saved.</p>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</WidgetCard>
</div>

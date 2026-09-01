<script lang="ts">
	import { page } from '$app/stores';
	import { sdk } from '$lib/sdk';
	import type { Organization } from '@neoworks-dev/sdk';
	import UploadSimpleIcon from 'phosphor-svelte/lib/UploadSimpleIcon';
	import GearIcon from 'phosphor-svelte/lib/GearIcon';
	import HashIcon from 'phosphor-svelte/lib/HashIcon';
	import PageHeader from '$lib/components/dashboard/PageHeader.svelte';
	import WidgetCard from '$lib/components/dashboard/WidgetCard.svelte';

	const orgId = $derived($page.params.id ?? "");

	let org = $state<Organization | null>(null);
	let loading = $state(true);

	let name = $state('');
	let description = $state('');
	let billingEmail = $state('');
	let logoUrl = $state<string | null>(null);
	let logoFile = $state<File | null>(null);
	let logoPreview = $state<string | null>(null);

	let saving = $state(false);
	let saved = $state(false);
	let error = $state<string | null>(null);

	$effect(() => {
		const id = orgId;
		loading = true;
		sdk.organizations.get(id).then((res) => {
			if (orgId !== id || !res) return;
			org = res;
			name = res.name;
			description = res.description ?? '';
			billingEmail = res.billing_email ?? '';
			logoUrl = res.logo_url ?? null;
			loading = false;
		});
	});

	function onLogoChange(event: Event) {
		const file = (event.target as HTMLInputElement).files?.[0] ?? null;
		logoFile = file;
		if (logoPreview) URL.revokeObjectURL(logoPreview);
		logoPreview = file ? URL.createObjectURL(file) : null;
	}

	async function save() {
		saving = true;
		saved = false;
		error = null;
		try {
			let nextLogoUrl = logoUrl ?? undefined;
			if (logoFile) {
				const asset = await sdk.assets.upload({ file: logoFile, visibility: 'public' });
				nextLogoUrl = asset.url;
			}
			org = await sdk.organizations.update(orgId, {
				name,
				description,
				billingEmail,
				logoUrl: nextLogoUrl,
			});
			logoUrl = org.logo_url ?? null;
			logoFile = null;
			logoPreview = null;
			saved = true;
		} catch (e: any) {
			error = e?.message ?? 'Could not save settings';
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>Organization settings — NeoWorks</title>
</svelte:head>

<div class="h-full overflow-y-auto space-y-2">
	<PageHeader title="Settings" subtitle="Manage your organization's profile and billing." />

	{#if loading}
		<WidgetCard title="Profile" subtitle="Organization name, logo and billing details." icon={GearIcon}>
			<div class="p-6 space-y-3">
				{#each { length: 3 } as _}<div class="skeleton h-10 w-full rounded-lg"></div>{/each}
			</div>
		</WidgetCard>
	{:else}
		<WidgetCard title="Profile" subtitle="Organization name, logo and billing details." icon={GearIcon}>
			<div class="p-6 space-y-5">
			<!-- Logo -->
			<div class="flex items-center gap-4">
				{#if logoPreview || logoUrl}
					<img src={logoPreview ?? logoUrl} alt="Logo" class="w-16 h-16 rounded-xl object-cover border border-line-faint" />
				{:else}
					<div class="w-16 h-16 rounded-xl bg-surface border border-line-faint flex items-center justify-center text-dim">
						<UploadSimpleIcon size={20} />
					</div>
				{/if}
				<label class="cursor-pointer flex items-center gap-2 h-9 px-4 rounded-lg border border-line text-[13px] text-muted hover:text-default hover:border-line-strong transition-colors">
					<UploadSimpleIcon size={15} />
					Change logo
					<input type="file" accept="image/*" class="hidden" onchange={onLogoChange} />
				</label>
			</div>

			<div>
				<label class="block text-[12px] font-medium text-muted mb-1.5" for="set-name">Name</label>
				<input id="set-name" bind:value={name} class="w-full h-9 px-3 rounded-lg border border-line bg-surface text-[13px] text-default focus:outline-none focus:border-primary transition-colors" />
			</div>

			<div>
				<label class="block text-[12px] font-medium text-muted mb-1.5" for="set-desc">Description</label>
				<textarea id="set-desc" bind:value={description} rows={3} class="w-full px-3 py-2 rounded-lg border border-line bg-surface text-[13px] text-default focus:outline-none focus:border-primary transition-colors resize-none"></textarea>
			</div>

			<div>
				<label class="block text-[12px] font-medium text-muted mb-1.5" for="set-billing">Billing email</label>
				<input id="set-billing" bind:value={billingEmail} class="w-full h-9 px-3 rounded-lg border border-line bg-surface text-[13px] text-default focus:outline-none focus:border-primary transition-colors" />
			</div>

			<div class="flex items-center gap-3 pt-1">
				<button
					class="h-9 px-4 rounded-lg bg-action text-action-fg text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
					onclick={save}
					disabled={saving}
				>{saving ? 'Saving…' : 'Save changes'}</button>
				{#if saved}<span class="text-[12px] text-green">Saved</span>{/if}
				{#if error}<span class="text-[12px] text-red">{error}</span>{/if}
			</div>
			</div>
		</WidgetCard>

		<WidgetCard title="Slug" subtitle="Your organization's unique identifier." icon={HashIcon}>
			<div class="p-6">
				<p class="text-[13px] font-mono text-muted">{org?.slug}</p>
			</div>
		</WidgetCard>
	{/if}
</div>

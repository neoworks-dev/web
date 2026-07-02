<script lang="ts">
	import { sdk } from '$lib/sdk';
	import { slugify } from '$lib/slug';
	import {
		emptyWizardState,
		buildCreateArgs,
		validInvites,
		isValidEmail,
		type OrgWizardState,
	} from '$lib/organizations';
	import type { Organization } from '@neoworks-dev/sdk';
	import XIcon from 'phosphor-svelte/lib/XIcon';
	import ArrowLeftIcon from 'phosphor-svelte/lib/ArrowLeftIcon';
	import PlusIcon from 'phosphor-svelte/lib/PlusIcon';
	import TrashIcon from 'phosphor-svelte/lib/TrashIcon';
	import UploadSimpleIcon from 'phosphor-svelte/lib/UploadSimpleIcon';

	let { oncancel, oncreated }: { oncancel: () => void; oncreated: (org: Organization) => void } =
		$props();

	const steps = ['Name', 'Slug', 'Description', 'Logo', 'Invite', 'Review'] as const;
	let stepIndex = $state(0);

	let form = $state<OrgWizardState>(emptyWizardState());
	let slugTouched = $state(false);
	let logoFile = $state<File | null>(null);
	let logoPreview = $state<string | null>(null);

	let submitting = $state(false);
	let error = $state<string | null>(null);

	// Keep slug auto-derived from name until the user edits it directly.
	$effect(() => {
		if (!slugTouched) form.slug = slugify(form.name);
	});

	function next() {
		error = null;
		if (stepIndex === 0 && !form.name.trim()) {
			error = 'Organization name is required.';
			return;
		}
		if (stepIndex === 1 && !form.slug.trim()) {
			error = 'A slug is required.';
			return;
		}
		if (stepIndex === 2) {
			if (!form.description.trim()) {
				error = 'A description is required.';
				return;
			}
			if (!form.billingEmail.trim()) {
				error = 'A billing email is required.';
				return;
			}
			if (!isValidEmail(form.billingEmail)) {
				error = 'Enter a valid billing email.';
				return;
			}
		}
		if (stepIndex < steps.length - 1) stepIndex += 1;
	}

	function back() {
		error = null;
		if (stepIndex > 0) stepIndex -= 1;
	}

	function onLogoChange(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0] ?? null;
		logoFile = file;
		if (logoPreview) URL.revokeObjectURL(logoPreview);
		logoPreview = file ? URL.createObjectURL(file) : null;
	}

	function addInvite() {
		form.invites = [...form.invites, { email: '', role: 'member' }];
	}

	function removeInvite(index: number) {
		form.invites = form.invites.filter((_invite, i) => i !== index);
	}

	async function submit() {
		submitting = true;
		error = null;
		try {
			const org = await sdk.organizations.create(buildCreateArgs(form));

			if (logoFile) {
				const asset = await sdk.assets.upload({ file: logoFile, visibility: 'public' });
				await sdk.organizations.update(org.id, { logoUrl: asset.url });
			}

			for (const invite of validInvites(form.invites)) {
				await sdk.organizations.createInvite(org.id, invite.email, invite.role);
			}

			oncreated(org);
		} catch (e: any) {
			error = e?.message ?? 'Could not create the organization.';
		} finally {
			submitting = false;
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
<div class="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-6" onclick={oncancel}>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="w-full max-w-lg rounded-2xl border border-line bg-elevated shadow-xl flex flex-col max-h-[85vh]"
		onclick={(e) => e.stopPropagation()}
	>
		<!-- Header + stepper -->
		<div class="flex items-center justify-between px-6 py-5 border-b border-line-faint">
			<div class="flex items-center gap-3">
				{#if stepIndex > 0}
					<button class="text-dim hover:text-default transition-colors" onclick={back} aria-label="Back">
						<ArrowLeftIcon size={18} />
					</button>
				{/if}
				<div>
					<h2 class="text-[15px] font-semibold text-default">New organization</h2>
					<p class="text-[12px] text-dim mt-0.5">Step {stepIndex + 1} of {steps.length} · {steps[stepIndex]}</p>
				</div>
			</div>
			<button class="text-dim hover:text-default transition-colors" onclick={oncancel} aria-label="Close">
				<XIcon size={18} />
			</button>
		</div>

		<!-- Progress bar -->
		<div class="h-1 bg-surface">
			<div
				class="h-full bg-primary transition-[width] duration-slow"
				style:width={`${((stepIndex + 1) / steps.length) * 100}%`}
			></div>
		</div>

		<!-- Body -->
		<div class="px-6 py-5 space-y-4 overflow-y-auto">
			{#if stepIndex === 0}
				<div>
					<label class="block text-[12px] font-medium text-muted mb-1.5" for="org-name">Name</label>
					<input
						id="org-name"
						bind:value={form.name}
						placeholder="Acme Inc."
						class="w-full h-9 px-3 rounded-lg border border-line bg-surface text-[13px] text-default placeholder:text-dim focus:outline-none focus:border-primary transition-colors"
					/>
					<p class="text-[12px] text-dim mt-1.5">The display name for your organization.</p>
				</div>
			{:else if stepIndex === 1}
				<div>
					<label class="block text-[12px] font-medium text-muted mb-1.5" for="org-slug">Slug</label>
					<input
						id="org-slug"
						value={form.slug}
						oninput={(e) => {
							slugTouched = true;
							form.slug = (e.target as HTMLInputElement).value;
						}}
						placeholder="acme"
						class="w-full h-9 px-3 rounded-lg border border-line bg-surface text-[13px] font-mono text-default placeholder:text-dim focus:outline-none focus:border-primary transition-colors"
					/>
					<p class="text-[12px] text-dim mt-1.5">
						Used as the organization token in scopes (e.g. <span class="font-mono">{form.slug || 'acme'}:contacts:read</span>). Must be unique.
					</p>
				</div>
			{:else if stepIndex === 2}
				<div>
					<label class="block text-[12px] font-medium text-muted mb-1.5" for="org-desc">Description</label>
					<textarea
						id="org-desc"
						bind:value={form.description}
						placeholder="What does this organization do?"
						rows={3}
						class="w-full px-3 py-2 rounded-lg border border-line bg-surface text-[13px] text-default placeholder:text-dim focus:outline-none focus:border-primary transition-colors resize-none"
					></textarea>
				</div>
				<div>
					<label class="block text-[12px] font-medium text-muted mb-1.5" for="org-billing">Billing email</label>
					<input
						id="org-billing"
						bind:value={form.billingEmail}
						placeholder="billing@acme.com"
						class="w-full h-9 px-3 rounded-lg border border-line bg-surface text-[13px] text-default placeholder:text-dim focus:outline-none focus:border-primary transition-colors"
					/>
				</div>
			{:else if stepIndex === 3}
				<div class="flex flex-col items-center gap-4 py-4">
					{#if logoPreview}
						<img src={logoPreview} alt="Logo preview" class="w-20 h-20 rounded-xl object-cover border border-line-faint" />
					{:else}
						<div class="w-20 h-20 rounded-xl bg-surface border border-line-faint flex items-center justify-center text-dim">
							<UploadSimpleIcon size={24} />
						</div>
					{/if}
					<label class="cursor-pointer flex items-center gap-2 h-9 px-4 rounded-lg border border-line text-[13px] text-muted hover:text-default hover:border-line-strong transition-colors">
						<UploadSimpleIcon size={15} />
						{logoFile ? 'Change logo' : 'Upload logo'}
						<input type="file" accept="image/*" class="hidden" onchange={onLogoChange} />
					</label>
					<p class="text-[12px] text-dim">Optional. PNG or JPG, served publicly.</p>
				</div>
			{:else if stepIndex === 4}
				<div class="space-y-3">
					<p class="text-[12px] text-dim">Invite teammates by email. They'll receive a link to join.</p>
					{#each form.invites as invite, index (index)}
						<div class="flex items-center gap-2">
							<input
								bind:value={invite.email}
								placeholder="teammate@acme.com"
								class="flex-1 h-9 px-3 rounded-lg border border-line bg-surface text-[13px] text-default placeholder:text-dim focus:outline-none focus:border-primary transition-colors"
							/>
							<select
								bind:value={invite.role}
								class="h-9 px-2 rounded-lg border border-line bg-surface text-[13px] text-default focus:outline-none focus:border-primary transition-colors"
							>
								<option value="member">Member</option>
								<option value="admin">Admin</option>
								<option value="billing">Billing</option>
								<option value="owner">Owner</option>
							</select>
							<button class="text-dim hover:text-red transition-colors p-1" onclick={() => removeInvite(index)} aria-label="Remove">
								<TrashIcon size={15} />
							</button>
						</div>
					{/each}
					<button class="flex items-center gap-1.5 text-[13px] text-primary hover:opacity-80 transition-opacity" onclick={addInvite}>
						<PlusIcon size={14} />
						Add teammate
					</button>
				</div>
			{:else}
				<div class="space-y-3 text-[13px]">
					{@render reviewRow('Name', form.name)}
					{@render reviewRow('Slug', form.slug)}
					{@render reviewRow('Description', form.description)}
					{@render reviewRow('Billing email', form.billingEmail)}
					{@render reviewRow('Logo', logoFile ? logoFile.name : 'None')}
					{@render reviewRow('Invites', validInvites(form.invites).length ? `${validInvites(form.invites).length} teammate(s)` : 'None')}
				</div>
			{/if}

			{#if error}
				<p class="text-[12px] text-red">{error}</p>
			{/if}
		</div>

		<!-- Footer -->
		<div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-line-faint">
			<button class="h-9 px-4 rounded-lg text-[13px] text-muted hover:text-default transition-colors" onclick={oncancel}>Cancel</button>
			{#if stepIndex < steps.length - 1}
				<button
					class="h-9 px-4 rounded-lg bg-primary text-primary-content text-[13px] font-medium hover:opacity-90 transition-opacity"
					onclick={next}
				>Continue</button>
			{:else}
				<button
					class="h-9 px-4 rounded-lg bg-primary text-primary-content text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
					onclick={submit}
					disabled={submitting}
				>{submitting ? 'Creating…' : 'Create organization'}</button>
			{/if}
		</div>
	</div>
</div>

{#snippet reviewRow(label: string, value: string)}
	<div class="flex items-start justify-between gap-4">
		<span class="text-[12px] text-dim uppercase tracking-caps">{label}</span>
		<span class="text-default text-right truncate max-w-[60%]">{value}</span>
	</div>
{/snippet}

<script lang="ts">
	import { goto } from '$app/navigation';
	import { sdk } from '$lib/sdk';
	import { slugify } from '$lib/slug';
	import { emptyOrgDetails, buildCreateArgs, isValidEmail } from '$lib/organizations';
	import UploadSimpleIcon from 'phosphor-svelte/lib/UploadSimpleIcon';

	let form = $state(emptyOrgDetails());
	let slugTouched = $state(false);
	let logoFile = $state<File | null>(null);
	let logoPreview = $state<string | null>(null);

	let submitting = $state(false);
	let error = $state<string | null>(null);

	// Keep the slug auto-derived from the name until the user edits it directly.
	$effect(() => {
		if (!slugTouched) form.slug = slugify(form.name);
	});

	function onLogoChange(event: Event) {
		const file = (event.target as HTMLInputElement).files?.[0] ?? null;
		logoFile = file;
		if (logoPreview) URL.revokeObjectURL(logoPreview);
		logoPreview = file ? URL.createObjectURL(file) : null;
	}

	function validate(): string | null {
		if (!form.name.trim()) return 'Organization name is required.';
		if (!form.slug.trim()) return 'A slug is required.';
		if (!form.description.trim()) return 'A description is required.';
		if (!form.billingEmail.trim()) return 'A billing email is required.';
		if (!isValidEmail(form.billingEmail)) return 'Enter a valid billing email.';
		return null;
	}

	async function submit() {
		const validationError = validate();
		if (validationError) {
			error = validationError;
			return;
		}

		submitting = true;
		error = null;
		try {
			const org = await sdk.organizations.create(buildCreateArgs(form));

			if (logoFile) {
				const asset = await sdk.assets.upload({ file: logoFile, visibility: 'public' });
				await sdk.organizations.update(org.id, { logoUrl: asset.url });
			}

			goto(`/dashboard/organizations/new/${org.id}/invite`);
		} catch (e: any) {
			error = e?.message ?? 'Could not create the organization.';
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>New organization · Details — NeoWorks</title>
</svelte:head>

<div class="space-y-5">
	<div>
		<h2 class="text-[15px] font-semibold text-default">Organization details</h2>
		<p class="text-[13px] text-dim mt-0.5">Name your organization and set its billing contact.</p>
	</div>

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
			Used as the organization token in scopes (e.g.
			<span class="font-mono">{form.slug || 'acme'}:contacts:read</span>). Must be unique.
		</p>
	</div>

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
		<p class="text-[12px] text-dim mt-1.5">Where invoices and billing notices are sent.</p>
	</div>

	<div>
		<span class="block text-[12px] font-medium text-muted mb-1.5">Logo</span>
		<div class="flex items-center gap-4">
			{#if logoPreview}
				<img src={logoPreview} alt="Logo preview" class="w-16 h-16 rounded-xl object-cover border border-line-faint" />
			{:else}
				<div class="w-16 h-16 rounded-xl bg-surface border border-line-faint flex items-center justify-center text-dim">
					<UploadSimpleIcon size={20} />
				</div>
			{/if}
			<label class="cursor-pointer flex items-center gap-2 h-9 px-4 rounded-lg border border-line text-[13px] text-muted hover:text-default hover:border-line-strong transition-colors">
				<UploadSimpleIcon size={15} />
				{logoFile ? 'Change logo' : 'Upload logo'}
				<input type="file" accept="image/*" class="hidden" onchange={onLogoChange} />
			</label>
		</div>
		<p class="text-[12px] text-dim mt-1.5">Optional. PNG or JPG, served publicly.</p>
	</div>

	{#if error}<p class="text-[12px] text-red">{error}</p>{/if}

	<div class="flex items-center justify-end gap-3 pt-2 border-t border-line-faint">
		<button
			class="h-9 px-4 rounded-lg text-[13px] text-muted hover:text-default transition-colors"
			onclick={() => goto('/dashboard/organizations')}
		>Cancel</button>
		<button
			class="h-9 px-4 rounded-lg bg-action text-action-fg text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
			onclick={submit}
			disabled={submitting}
		>{submitting ? 'Creating…' : 'Continue'}</button>
	</div>
</div>

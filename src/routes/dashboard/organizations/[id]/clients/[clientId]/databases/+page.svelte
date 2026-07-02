<script lang="ts">
	import { page } from '$app/stores';
	import DatabaseIcon from 'phosphor-svelte/lib/DatabaseIcon';
	import PlusIcon from 'phosphor-svelte/lib/PlusIcon';
	import CopyIcon from 'phosphor-svelte/lib/CopyIcon';
	import CheckIcon from 'phosphor-svelte/lib/CheckIcon';
	import XIcon from 'phosphor-svelte/lib/XIcon';
	import DatabaseDesigner from '$lib/components/database-designer/DatabaseDesigner.svelte';
	import PageHeader from '$lib/components/dashboard/PageHeader.svelte';
	import WidgetCard from '$lib/components/dashboard/WidgetCard.svelte';
	import { sdk } from '$lib/sdk';
	import type { ClientDatabase, DatabaseSchema } from '@neoworks-dev/sdk';

	const clientId = $derived($page.params.clientId ?? '');

	let databases = $state<ClientDatabase[]>([]);
	let loading = $state(true);

	let view = $state<'list' | 'designer'>('list');
	let createError = $state<string | null>(null);

	let newDbPassword = $state<string | null>(null);
	let copied = $state(false);

	$effect(() => {
		const id = clientId;
		if (!id) return;
		loading = true;
		sdk.databases
			.list(id)
			.then((res) => {
				databases = res;
				loading = false;
			})
			.catch(() => {
				loading = false;
			});
	});

	function fmt(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
		});
	}

	function statusColor(status: string): string {
		switch (status) {
			case 'ready': return 'text-green';
			case 'provisioning': return 'text-amber';
			case 'error': return 'text-red';
			default: return 'text-dim';
		}
	}

	async function handleDesignerConfirm(name: string, schema: DatabaseSchema) {
		createError = null;
		const res = await sdk.databases.create(clientId, name, schema);
		databases = [res.database, ...databases];
		newDbPassword = res.db_password;
		view = 'list';
	}

	async function copyPassword() {
		if (!newDbPassword) return;
		await navigator.clipboard.writeText(newDbPassword);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<svelte:head>
	<title>Databases — NeoWorks</title>
</svelte:head>

{#if view === 'designer'}
	<div class="h-full">
		<DatabaseDesigner
			onconfirm={handleDesignerConfirm}
			oncancel={() => {
				view = 'list';
				createError = null;
			}}
		/>
	</div>
{:else}
	<div class="h-full overflow-y-auto space-y-2">
		<PageHeader title="Databases" subtitle="SurrealDB instances provisioned for this client.">
			{#snippet actions()}
				<button
					type="button"
					onclick={() => {
						view = 'designer';
						createError = null;
					}}
					class="flex items-center gap-2 h-9 px-4 rounded-lg text-[13px] font-medium bg-primary text-inverse hover:opacity-90 transition-opacity duration-fast"
				>
					<PlusIcon size={15} />
					New Database
				</button>
			{/snippet}
		</PageHeader>

		{#if newDbPassword}
			<div class="rounded-xl border border-amber/30 bg-amber-soft p-5 space-y-3">
				<div class="flex items-start justify-between gap-4">
					<div>
						<p class="text-[13px] font-semibold text-default">Database created — save your password now</p>
						<p class="text-[12px] text-dim mt-0.5">This password will not be shown again.</p>
					</div>
					<button
						type="button"
						onclick={() => {
							newDbPassword = null;
							copied = false;
						}}
						class="text-dim hover:text-default transition-colors duration-fast shrink-0"
						aria-label="Dismiss"
					>
						<XIcon size={16} />
					</button>
				</div>
				<div class="flex items-center gap-2">
					<code
						class="flex-1 font-mono text-[12px] bg-surface border border-line-faint rounded-lg px-3 py-2 text-default overflow-x-auto"
					>
						{newDbPassword}
					</code>
					<button
						type="button"
						onclick={copyPassword}
						class="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-medium border transition-colors duration-fast
							{copied
							? 'border-green/30 bg-green-soft text-green'
							: 'border-line-faint bg-surface text-muted hover:text-default hover:border-line-strong'}"
					>
						{#if copied}
							<CheckIcon size={13} />
							Copied
						{:else}
							<CopyIcon size={13} />
							Copy
						{/if}
					</button>
				</div>
			</div>
		{/if}

		{#if createError}
			<div class="rounded-xl border border-red/30 bg-red-soft px-4 py-3 text-[13px] text-red">
				{createError}
			</div>
		{/if}

		<WidgetCard
			title="Your Databases"
			subtitle="All databases provisioned under this client."
			icon={DatabaseIcon}
		>
			<div class="p-6">
			{#if loading}
				<div class="space-y-2">
					{#each { length: 3 } as _}
						<div class="skeleton h-10 w-full rounded-lg"></div>
					{/each}
				</div>
			{:else if databases.length === 0}
				<div class="flex flex-col items-center justify-center py-12 text-center">
					<DatabaseIcon size={28} class="text-dim mb-3" />
					<p class="text-sm font-medium text-muted">No databases yet</p>
					<p class="text-xs text-dim mt-1">Create a database to get started.</p>
				</div>
			{:else}
				<div class="rounded-lg border border-line-faint overflow-hidden">
					<table class="w-full text-[13px]">
						<thead>
							<tr class="border-b border-line-faint bg-surface">
								<th class="px-4 py-2.5 text-left font-medium text-dim uppercase tracking-caps text-[11px]">Name</th>
								<th class="px-4 py-2.5 text-left font-medium text-dim uppercase tracking-caps text-[11px]">DB Name</th>
								<th class="px-4 py-2.5 text-left font-medium text-dim uppercase tracking-caps text-[11px]">Status</th>
								<th class="px-4 py-2.5 text-left font-medium text-dim uppercase tracking-caps text-[11px]">Created</th>
							</tr>
						</thead>
						<tbody>
							{#each databases as db (db.id)}
								<tr class="border-b border-line-faint last:border-0 hover:bg-hover transition-colors duration-fast">
									<td class="px-4 py-3 font-medium text-default">{db.name}</td>
									<td class="px-4 py-3 font-mono text-[12px] text-muted">{db.db_name}</td>
									<td class="px-4 py-3">
										<span class="text-[11px] font-medium capitalize {statusColor(db.status)}">{db.status}</span>
									</td>
									<td class="px-4 py-3 text-muted">{fmt(db.created_at)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
			</div>
		</WidgetCard>
	</div>
{/if}

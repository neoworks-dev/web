<script lang="ts">
	import { Card, StatusBadge } from '@neoworks-dev/ui';
	import PageHeader from '$lib/components/dashboard/PageHeader.svelte';
	import WidgetCard from '$lib/components/dashboard/WidgetCard.svelte';
	import { holdsPermission, missingPermissionText } from '$lib/developer/permissions';
	import DatabaseIcon from 'phosphor-svelte/lib/DatabaseIcon';
	import TerminalWindowIcon from 'phosphor-svelte/lib/TerminalWindowIcon';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const canPublish = $derived(holdsPermission(data.grants, 'schemas.publish'));
</script>

<svelte:head>
	<title>Schemas — NeoWorks</title>
</svelte:head>

<div class="h-full space-y-2 overflow-y-auto">
	<PageHeader title="Schemas" subtitle="Collections published in the @{data.owner.handle} scope." />

	<WidgetCard title="Publish from the command line" icon={TerminalWindowIcon}>
		<div class="flex flex-col gap-3 p-4">
			<div class="flex items-center gap-2">
				{#if canPublish}
					<StatusBadge tone="green">You can publish</StatusBadge>
				{:else}
					<StatusBadge tone="amber">{missingPermissionText('schemas.publish')}</StatusBadge>
				{/if}
				<a class="text-sm text-blue hover:underline" href={data.openschemaUrl}>Open the OpenSchema site</a>
			</div>
			<pre class="overflow-x-auto rounded-lg bg-input px-3 py-2 font-mono text-xs text-default">openschema login
openschema publish</pre>
			<p class="text-xs text-dim">
				Publishing is checked against your permissions on @{data.owner.handle}. Rejected publishes appear below with the
				compatibility rules they broke.
			</p>
		</div>
	</WidgetCard>

	{#if data.histories.length === 0}
		<p class="rounded-xl border border-line-faint bg-elevated p-5 text-sm text-dim">Nothing published in this scope yet.</p>
	{/if}

	{#each data.histories as { schema, publishes } (schema.name)}
		<WidgetCard title="@{schema.scope}/{schema.name}" subtitle="Latest {schema.latestVersion}" icon={DatabaseIcon}>
			<ul class="flex flex-col gap-2 p-4" data-testid="publishes-{schema.name}">
				{#each publishes as publish (publish.version)}
					<li>
						<Card surface="raised" padding="sm">
							<div class="flex flex-wrap items-center gap-2">
								<span class="font-mono text-sm text-default">{publish.version}</span>
								{#if publish.accepted}
									<StatusBadge tone="green">Accepted</StatusBadge>
								{:else}
									<StatusBadge tone="red">Rejected</StatusBadge>
								{/if}
								<span class="text-xs text-dim">
									{new Date(publish.at).toLocaleDateString()} · {publish.actor.displayName}
								</span>
							</div>
							{#if publish.violations.length > 0}
								<ul class="mt-2 flex flex-col gap-1.5">
									{#each publish.violations as violation (violation.rule + violation.path)}
										<li class="rounded-md bg-red-soft px-2 py-1.5 text-xs text-red">
											<span class="font-mono">{violation.rule}</span> · <span class="font-mono">{violation.path}</span>
											<p>{violation.message}</p>
										</li>
									{/each}
								</ul>
							{/if}
						</Card>
					</li>
				{/each}
			</ul>
		</WidgetCard>
	{/each}
</div>

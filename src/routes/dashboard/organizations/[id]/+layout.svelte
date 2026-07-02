<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { sdk } from '$lib/sdk';
	import { useViewContext } from '$lib/context/viewContext.svelte.js';
	import OrgContextPanel from '$lib/components/organizations/OrgContextPanel.svelte';
	import type { Organization } from '@neoworks-dev/sdk';

	let { children }: { children: Snippet } = $props();

	const viewCtx = useViewContext();
	const orgId = $derived($page.params.id ?? "");

	let organization = $state<Organization | null>(null);

	// Reload whenever the org id in the route changes.
	$effect(() => {
		const id = orgId;
		organization = null;
		sdk.organizations.get(id).then((org) => {
			if (orgId === id) organization = org;
		});
	});

	// Swap the dashboard sidebar for the org-context panel while inside an org.
	$effect(() => {
		viewCtx.setSidebarPanel({
			component: OrgContextPanel,
			label: 'Organizations',
			onback: () => goto('/dashboard/organizations'),
			props: () => ({
				orgId,
				orgName: organization?.name ?? 'Organization',
				logoUrl: organization?.logo_url,
			}),
		});
		return () => viewCtx.setSidebarPanel(null);
	});
</script>

{@render children()}

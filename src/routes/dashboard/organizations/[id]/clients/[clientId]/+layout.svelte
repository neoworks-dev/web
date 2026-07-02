<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { useViewContext } from '$lib/context/viewContext.svelte';
	import ClientSidebarPanel from '$lib/components/dashboard/ClientSidebarPanel.svelte';

	let { children }: { children: Snippet } = $props();

	const viewCtx = useViewContext();
	const orgId = $derived($page.params.id ?? '');
	const clientId = $derived($page.params.clientId ?? '');

	// Swap the sidebar to the client's contextual nav while inside a client route.
	$effect(() => {
		const oid = orgId;
		const cid = clientId;
		viewCtx.setSidebarPanel({
			component: ClientSidebarPanel,
			props: () => ({ orgId: oid, clientId: cid }),
			label: cid,
			onback: () => {
				viewCtx.setSidebarPanel(null);
				goto(`/dashboard/organizations/${oid}/clients`);
			},
		});
		return () => viewCtx.setSidebarPanel(null);
	});
</script>

{@render children()}

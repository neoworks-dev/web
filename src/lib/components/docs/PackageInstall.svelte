<script lang="ts">
	import { onMount } from 'svelte';
	import {
		choosePackageManager,
		installCommand,
		loadPackageManagerPreference,
		packageManagerPreference,
		packageManagers,
		type PackageManager
	} from '$lib/docs/packageManager.svelte';
	import Terminal from './Terminal.svelte';

	let { name, dev = false }: { name: string; dev?: boolean } = $props();

	const tabs = $derived(
		packageManagers.map((manager) => ({ label: manager, command: installCommand(manager, name, dev) }))
	);

	onMount(loadPackageManagerPreference);

	function select(label: string) {
		choosePackageManager(label as PackageManager);
	}
</script>

<Terminal {tabs} selectedLabel={packageManagerPreference.current} onSelect={select} />

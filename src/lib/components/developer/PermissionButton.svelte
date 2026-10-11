<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Permission } from '@neoworks-dev/platform';
	import { Button, Tooltip } from '@neoworks-dev/ui';
	import { missingPermissionText } from '$lib/developer/permissions';

	let {
		allowed,
		permission,
		variant = 'surface',
		size = 'sm',
		type = 'submit',
		onclick = undefined,
		children,
	}: {
		allowed: boolean;
		permission: Permission;
		variant?: 'primary' | 'surface' | 'ghost' | 'success' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		type?: 'button' | 'submit';
		onclick?: (event: MouseEvent) => void;
		children: Snippet;
	} = $props();
</script>

{#if allowed}
	<Button {variant} {size} {type} {onclick}>{@render children()}</Button>
{:else}
	<span class="inline-flex items-center gap-2">
		<Tooltip text={missingPermissionText(permission)}>
			<Button {variant} {size} {type} disabled>{@render children()}</Button>
		</Tooltip>
		<span class="text-xs text-faint">Requires {permission}</span>
	</span>
{/if}

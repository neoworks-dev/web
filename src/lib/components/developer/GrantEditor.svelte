<script lang="ts">
	import type { Grant, Permission } from '@neoworks-dev/sdk';
	import { Button, Checkbox } from '@neoworks-dev/ui';
	import {
		GRANT_PRESETS,
		ORGANIZATION_WIDE_PERMISSIONS,
		PERMISSION_DESCRIPTIONS,
		PER_APP_PERMISSIONS,
		escalatingGrants,
		hasGrant,
		presetGrants,
		withGrant,
		type GrantPresetKey,
	} from '$lib/developer/permissions';

	let {
		grants = $bindable([]),
		apps,
		callerGrants,
		name = 'grants',
		disabled = false,
	}: {
		grants?: Grant[];
		apps: { id: string; name: string }[];
		callerGrants: Grant[];
		name?: string;
		disabled?: boolean;
	} = $props();

	const exceeding = $derived(escalatingGrants(callerGrants, grants));

	function applyPreset(key: GrantPresetKey) {
		grants = presetGrants(key);
	}

	function toggle(permission: Permission, appId: string | null, enabled: boolean) {
		grants = withGrant(grants, { permission, appId }, enabled);
	}

	function reachLabel(appName: string | null): string {
		if (appName === null) {
			return 'organization-wide';
		}
		return appName;
	}
</script>

<div class="flex flex-col gap-3">
	<input type="hidden" {name} value={JSON.stringify(grants)} />

	<div class="flex flex-wrap items-center gap-2">
		<span class="text-xs text-dim">Start from</span>
		{#each GRANT_PRESETS as preset (preset.key)}
			<Button size="sm" variant="ghost" {disabled} onclick={() => applyPreset(preset.key)}>{preset.label}</Button>
		{/each}
	</div>

	<ul class="flex flex-col gap-2">
		{#each ORGANIZATION_WIDE_PERMISSIONS as permission (permission)}
			<li class="flex items-start gap-3 rounded-lg bg-raised px-3 py-2">
				<Checkbox
					size="sm"
					checked={hasGrant(grants, permission, null)}
					{disabled}
					aria-label="{permission} organization-wide"
					onchange={(event: Event) => toggle(permission, null, (event.currentTarget as HTMLInputElement).checked)}
				/>
				<div class="min-w-0">
					<p class="font-mono text-xs text-default">{permission}</p>
					<p class="text-xs text-dim">{PERMISSION_DESCRIPTIONS[permission]}</p>
				</div>
			</li>
		{/each}

		{#each PER_APP_PERMISSIONS as permission (permission)}
			<li class="flex flex-col gap-2 rounded-lg bg-raised px-3 py-2">
				<div>
					<p class="font-mono text-xs text-default">{permission}</p>
					<p class="text-xs text-dim">{PERMISSION_DESCRIPTIONS[permission]}</p>
				</div>
				<div class="flex flex-wrap gap-x-4 gap-y-1">
					{#each [{ id: null, name: null }, ...apps] as reach (reach.id)}
						<label class="flex items-center gap-1.5 text-xs text-muted">
							<Checkbox
								size="sm"
								checked={hasGrant(grants, permission, reach.id)}
								{disabled}
								aria-label="{permission} {reachLabel(reach.name)}"
								onchange={(event: Event) =>
									toggle(permission, reach.id, (event.currentTarget as HTMLInputElement).checked)}
							/>
							<span>{reachLabel(reach.name)}</span>
						</label>
					{/each}
				</div>
			</li>
		{/each}
	</ul>

	{#if exceeding.length > 0}
		<p class="text-xs text-amber">
			You do not hold {exceeding.map((grant) => grant.permission).join(', ')} at this reach; the server refuses to
			grant more than you hold.
		</p>
	{/if}
</div>

<script lang="ts">
	import type { RegistrySchema, RequestedScope } from '@neoworks-dev/sdk';
	import { Checkbox } from '@neoworks-dev/ui';

	let {
		schemas,
		selected = $bindable([]),
		disabled = false,
		error = '',
	}: {
		schemas: RegistrySchema[];
		selected?: RequestedScope[];
		disabled?: boolean;
		error?: string;
	} = $props();

	const IDENTITY_SCOPES = ['openid', 'profile', 'email'];
	const ACCESS_LEVELS = ['read', 'write', 'share'];

	function isSelected(scope: string): boolean {
		return selected.some((entry) => entry.scope === scope);
	}

	function toggle(scope: string, enabled: boolean) {
		const others = selected.filter((entry) => entry.scope !== scope);
		if (!enabled) {
			selected = others;
			return;
		}
		selected = [...others, { scope, reason: '' }];
	}

	function onToggle(scope: string, event: Event) {
		toggle(scope, (event.currentTarget as HTMLInputElement).checked);
	}
</script>

<div class="flex flex-col gap-3">
	<div>
		<p class="text-xs font-medium text-muted">Requested scopes</p>
		<p class="text-xs text-dim">Identity scopes and the collections this app reads or writes.</p>
	</div>

	<div class="flex flex-wrap gap-4">
		{#each IDENTITY_SCOPES as scope (scope)}
			<label class="flex items-center gap-1.5 text-sm text-default">
				<Checkbox
					checked={isSelected(scope)}
					{disabled}
					aria-label="Scope {scope}"
					onchange={(event: Event) => onToggle(scope, event)}
				/>
				<span class="font-mono text-xs">{scope}</span>
			</label>
		{/each}
	</div>

	<ul class="flex flex-col gap-2">
		{#each schemas as schema (`${schema.scope}/${schema.name}`)}
			<li class="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-raised px-3 py-2">
				<span class="font-mono text-xs text-default">@{schema.scope}/{schema.name}</span>
				<div class="flex gap-3">
					{#each ACCESS_LEVELS as level (level)}
						{@const scope = `@${schema.scope}/${schema.name}:${level}`}
						<label class="flex items-center gap-1.5 text-xs text-muted">
							<Checkbox
								size="sm"
								checked={isSelected(scope)}
								{disabled}
								aria-label="Scope {scope}"
								onchange={(event: Event) => onToggle(scope, event)}
							/>
							<span>{level}</span>
						</label>
					{/each}
				</div>
			</li>
		{/each}
	</ul>

	{#if selected.length > 0}
		<div class="flex flex-col gap-2">
			<p class="text-xs font-medium text-muted">Why does the app need them?</p>
			{#each selected as entry (entry.scope)}
				<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
					<input type="hidden" name="scope" value={entry.scope} />
					<span class="font-mono text-xs text-default sm:w-56 sm:shrink-0">{entry.scope}</span>
					<input
						name="reason:{entry.scope}"
						bind:value={entry.reason}
						{disabled}
						placeholder="Reason shown to users"
						aria-label="Reason for {entry.scope}"
						class="h-9 w-full rounded-lg border border-line bg-input px-3 text-sm text-default placeholder:text-faint focus:border-line-strong focus:outline-none disabled:opacity-50"
					/>
				</div>
			{/each}
		</div>
	{/if}

	{#if error !== ''}
		<p class="text-xs text-red" role="alert">{error}</p>
	{/if}
</div>

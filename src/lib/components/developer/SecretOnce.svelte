<script lang="ts">
	import { Button, StatusBadge } from '@neoworks-dev/ui';

	let { secret, title = 'Client secret' }: { secret: string; title?: string } = $props();

	let copied = $state(false);

	async function copySecret() {
		await navigator.clipboard.writeText(secret);
		copied = true;
	}
</script>

<div class="flex flex-col gap-2 rounded-xl border border-line bg-raised p-4" data-testid="client-secret">
	<div class="flex items-center gap-2">
		<p class="text-sm font-medium text-default">{title}</p>
		<StatusBadge tone="amber">Shown once</StatusBadge>
	</div>
	<code class="block break-all rounded-lg bg-input px-3 py-2 font-mono text-xs text-default">{secret}</code>
	<p class="text-xs text-dim">Copy it now. It cannot be shown again; rotate the secret if you lose it.</p>
	<div>
		<Button size="sm" onclick={copySecret}>{#if copied}Copied{:else}Copy secret{/if}</Button>
	</div>
</div>

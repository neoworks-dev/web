<script lang="ts">
	import SectionHeading from '../landing/SectionHeading.svelte';
	import FingerprintIcon from 'phosphor-svelte/lib/FingerprintIcon';
	import LockKeyIcon from 'phosphor-svelte/lib/LockKeyIcon';
	import DatabaseIcon from 'phosphor-svelte/lib/DatabaseIcon';
	import LightningIcon from 'phosphor-svelte/lib/LightningIcon';
	import TreeStructureIcon from 'phosphor-svelte/lib/TreeStructureIcon';
	import ReceiptIcon from 'phosphor-svelte/lib/ReceiptIcon';

	const capabilities = [
		{
			title: 'OAuth identity',
			body: 'Standard PKCE flow with scoped grants. Nodes publish JWKS so your app verifies tokens offline.',
			Icon: FingerprintIcon
		},
		{
			title: 'Encrypted media',
			body: 'End-to-end encrypted blob storage for files, images and video. Upload and stream; we hold only ciphertext.',
			Icon: LockKeyIcon
		},
		{
			title: 'Queryable data',
			body: 'A per-user SurrealDB with full SurrealQL and row-level isolation for the structured data you need to query.',
			Icon: DatabaseIcon
		},
		{
			title: 'Real-time sync',
			body: 'NATS JetStream events fan changes out across a user’s devices and your app instances in milliseconds.',
			Icon: LightningIcon
		},
		{
			title: 'Cross-app data graph',
			body: 'OpenSchema TOML contracts let apps share the same shapes — read a user’s contacts your app never had to collect.',
			Icon: TreeStructureIcon
		},
		{
			title: 'Built-in revenue',
			body: '€1.50 per active Pro user each month, split across the apps they used, paid out automatically. 0% taken from your share.',
			Icon: ReceiptIcon
		}
	];
</script>

<section class="border-t border-line-faint px-6 py-24 max-md:py-16">
	<div class="mx-auto max-w-[1120px]">
		<SectionHeading
			eyebrow="Capabilities"
			title="Everything your app needs — none you have to build."
			subtitle="Auth, storage, sync, a database and a payout pipeline, all behind one OAuth client. Bring the product; skip the platform."
		/>

		<div class="mt-12 grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1">
			{#each capabilities as { title, body, Icon }}
				<div class="rounded-2xl border border-line-faint bg-elevated/50 p-6">
					<span
						class="flex size-11 items-center justify-center rounded-xl border border-line-faint bg-raised text-muted"
					>
						<Icon size={22} weight="duotone" />
					</span>
					<h3 class="mt-5 text-base font-semibold tracking-tight text-default">{title}</h3>
					<p class="mt-2 text-sm leading-relaxed text-muted">{body}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

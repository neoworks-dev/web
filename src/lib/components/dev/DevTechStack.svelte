<script lang="ts">
	import SectionHeading from '../landing/SectionHeading.svelte';

	const techStack = [
		{ name: 'SurrealDB', role: 'Multi-model DB. Your schema, row-level isolation, live queries.' },
		{ name: 'NATS', role: 'JetStream for real-time events. Fan-out across user devices.' },
		{ name: 'Redis', role: 'Session tokens, write queue buffer, rate limiting.' },
		{ name: 'OAuth 2.0', role: 'Standard PKCE flow. Works with any OAuth library.' },
		{ name: 'JWKS', role: 'Nodes cache public keys. Your app verifies tokens offline.' },
		{ name: 'OpenSchema', role: 'TOML data contracts. Schema-first, cross-app data sharing.' }
	];
</script>

<section class="border-t border-line-faint px-6 py-24 max-md:py-16">
	<div class="mx-auto max-w-[1120px]">
		<SectionHeading
			eyebrow="Infrastructure"
			title="Production-grade from day one."
			subtitle="You write your app logic. NeoWorks handles auth, storage, sync, and billing infrastructure."
		/>

		<div class="mt-12 grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1">
			{#each techStack as tech}
				<div class="rounded-2xl border border-line-faint bg-elevated/50 p-5">
					<div class="mb-2 font-mono text-[13px] font-medium text-default">{tech.name}</div>
					<p class="text-[13px] leading-relaxed text-muted">{tech.role}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

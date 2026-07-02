<script lang="ts">
	import SectionHeading from '../landing/SectionHeading.svelte';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';

	const schemas = [
		{ name: 'contacts', version: '1.0', apps: ['Vine', 'Twig', 'Tide'], desc: 'People — name, email, phone, avatar.' },
		{ name: 'tasks', version: '1.0', apps: ['Twig'], desc: 'Tasks with due dates, notes, subtasks.' },
		{ name: 'events', version: '1.0', apps: ['Tide'], desc: 'Calendar events, recurrence rules.' },
		{ name: 'files', version: '1.0', apps: ['Grove', 'Relay'], desc: 'File nodes in the DAG filesystem.' },
		{ name: 'trips', version: '1.0', apps: ['Trail'], desc: 'Route, waypoints, media attachments.' },
		{ name: 'secrets', version: '1.0', apps: ['Vault'], desc: 'E2E-encrypted credential entries.' }
	];
</script>

<section class="border-t border-line-faint px-6 py-24 max-md:py-16">
	<div class="mx-auto max-w-[1120px]">
		<SectionHeading
			eyebrow="OpenSchema"
			title="Your app speaks the same language as every other app."
			subtitle="OpenSchema defines shared data primitives — contacts, events, tasks, files. Build on them and your app gets cross-app data for free, with user consent."
		/>

		<div class="mt-12 grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1">
			{#each schemas as schema}
				<div class="rounded-2xl border border-line-faint bg-elevated/50 p-5">
					<div class="mb-3 flex items-baseline gap-2">
						<span class="font-mono text-[13px] font-medium text-default">openschema/{schema.name}</span>
						<span class="font-mono text-[9px] text-dim">@{schema.version}</span>
					</div>
					<p class="mb-4 text-[12px] leading-relaxed text-muted">{schema.desc}</p>
					<div class="flex flex-wrap gap-1.5">
						{#each schema.apps as app}
							<span
								class="rounded-full border border-line-faint bg-raised px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-dim"
							>
								{app}
							</span>
						{/each}
					</div>
				</div>
			{/each}
		</div>

		<div class="mt-8 flex flex-wrap gap-3">
			<a
				href="/docs/neoworks/openschema"
				class="flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-hover hover:text-default"
			>
				Browse OpenSchema
				<ArrowRightIcon size={14} weight="bold" />
			</a>
			<a
				href="/docs/neoworks/openschema"
				class="flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-hover hover:text-default"
			>
				Define your own schema
				<ArrowRightIcon size={14} weight="bold" />
			</a>
		</div>
	</div>
</section>

<script lang="ts">
	import SectionHeading from '../landing/SectionHeading.svelte';
	import LockKeyIcon from 'phosphor-svelte/lib/LockKeyIcon';
	import DatabaseIcon from 'phosphor-svelte/lib/DatabaseIcon';
	import CheckIcon from 'phosphor-svelte/lib/CheckIcon';

	const encrypted = [
		'Encrypted on the client with keys only the user holds',
		'NeoWorks stores opaque ciphertext — we can’t read it',
		'Content-addressed blobs, deduplicated and versioned'
	];

	const queryable = [
		'Full SurrealQL — joins, aggregations, live queries',
		'Per-user row isolation enforced at the database layer',
		'Reached only through the scopes the user granted you'
	];
</script>

<section class="border-t border-line-faint px-6 py-24 max-md:py-16">
	<div class="mx-auto max-w-[1120px]">
		<SectionHeading
			eyebrow="Storage model"
			title="Two stores, one account."
			subtitle="Not everything can be encrypted the same way. Media is sealed end-to-end; structured data stays queryable. Knowing which is which is the whole game when you build on NeoWorks."
		/>

		<div class="mt-12 grid grid-cols-2 gap-4 max-md:grid-cols-1">
			<!-- Encrypted media vault -->
			<div class="flex flex-col rounded-2xl border border-line-faint bg-elevated/50 p-7">
				<div class="flex items-center gap-3">
					<span
						class="flex size-11 items-center justify-center rounded-xl border border-line-faint bg-raised text-muted"
					>
						<LockKeyIcon size={22} weight="duotone" />
					</span>
					<div>
						<h3 class="text-base font-semibold tracking-tight text-default">Encrypted media vault</h3>
						<p class="font-mono text-[11px] uppercase tracking-[0.1em] text-dim">
							Files · Images · Video · Docs
						</p>
					</div>
				</div>
				<p class="mt-4 text-sm leading-relaxed text-muted">
					Anything that’s just bytes is end-to-end encrypted. Your app uploads and downloads it;
					NeoWorks only ever sees the ciphertext.
				</p>
				<ul class="mt-5 flex flex-col gap-2.5">
					{#each encrypted as item}
						<li class="flex items-start gap-2.5 text-sm text-muted">
							<CheckIcon size={16} weight="bold" class="mt-0.5 shrink-0 text-primary" />
							{item}
						</li>
					{/each}
				</ul>
			</div>

			<!-- Queryable data store -->
			<div class="flex flex-col rounded-2xl border border-line-faint bg-elevated/50 p-7">
				<div class="flex items-center gap-3">
					<span
						class="flex size-11 items-center justify-center rounded-xl border border-line-faint bg-raised text-muted"
					>
						<DatabaseIcon size={22} weight="duotone" />
					</span>
					<div>
						<h3 class="text-base font-semibold tracking-tight text-default">Queryable data store</h3>
						<p class="font-mono text-[11px] uppercase tracking-[0.1em] text-dim">
							Contacts · Calendar · Tasks
						</p>
					</div>
				</div>
				<p class="mt-4 text-sm leading-relaxed text-muted">
					Structured records you need to filter, sort and join can’t be opaque — so they live in a
					per-user database, not under end-to-end encryption. Ownership and isolation protect them
					instead.
				</p>
				<ul class="mt-5 flex flex-col gap-2.5">
					{#each queryable as item}
						<li class="flex items-start gap-2.5 text-sm text-muted">
							<CheckIcon size={16} weight="bold" class="mt-0.5 shrink-0 text-primary" />
							{item}
						</li>
					{/each}
				</ul>
			</div>
		</div>

		<p class="mt-6 text-center text-xs text-dim">
			Rule of thumb: if it’s a blob, it’s encrypted end-to-end. If you need to query it, it’s
			isolated per user but readable server-side.
		</p>
	</div>
</section>

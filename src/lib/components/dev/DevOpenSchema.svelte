<script lang="ts">
	import SectionHeading from '../landing/SectionHeading.svelte';
	import SchemaCode from './SchemaCode.svelte';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';

	// A real, compilable OpenSchema slice — the same DSL the in-dashboard database
	// designer speaks. Highlighted live by the project's tree-sitter grammar.
	const SAMPLE = `namespace contacts

/// A person in the shared address book. Any app the
/// user grants \`contacts:read\` sees the same records.
model Contact {
  @visibility("read")
  1 id: uuid

  /// vCard FN — the display name.
  2 formatted_name: string

  3 emails: [ContactField]?
  4 phones: [ContactField]?

  /// Encrypted media handle — never inline bytes.
  5 photo: uuid?
  6 favorite: bool

  @visibility("read")
  7 updated_at: timestamp
}

/// A typed, repeatable value (EMAIL, TEL, URL).
model ContactField {
  1 value: string
  2 types: [string]?
  3 pref: i32?
}

@query op contacts(search: string?, limit: i32?): [Contact]
@mutation op createContact(input: Contact): Contact
`;

	// The shipped primitives every app can build on.
	const primitives = ['contacts', 'events', 'tasks', 'calendars', 'files'];

	const points = [
		{
			title: 'Versioned & user-scoped',
			desc: 'Each model is owned by the signed-in user and carries an append-only history — for free.'
		},
		{
			title: 'Typed lists & references',
			desc: 'Fields reference other models and repeat as typed lists, so cross-app data stays structured.'
		},
		{
			title: 'One source, two surfaces',
			desc: 'Decorators compile the same schema down to SurrealDB tables and a typed GraphQL + REST API.'
		}
	];
</script>

<section id="openschema" class="scroll-mt-28 border-t border-line-faint px-6 py-24 max-md:py-16">
	<div class="mx-auto max-w-[1120px]">
		<SectionHeading
			eyebrow="OpenSchema"
			title="Your app speaks the same language as every other app."
			subtitle="OpenSchema is a small DSL for shared data primitives — contacts, events, tasks, files. Build on them and your app gets structured, cross-app data for free, with user consent."
		/>

		<div class="mt-12 grid grid-cols-5 gap-6 max-lg:grid-cols-1">
			<!-- Live-highlighted schema source. -->
			<div class="col-span-3 overflow-hidden rounded-2xl border border-line-faint bg-elevated/50 max-lg:col-span-1">
				<div class="flex items-center gap-2 border-b border-line-faint px-4 py-2.5">
					<span class="size-2 rounded-full bg-line"></span>
					<span class="font-mono text-[11px] text-dim">contacts.schema</span>
				</div>
				<div class="p-2">
					<SchemaCode source={SAMPLE} />
				</div>
			</div>

			<!-- What the schema buys you. -->
			<div class="col-span-2 flex flex-col gap-5 max-lg:col-span-1">
				<div>
					<p class="mb-2 font-mono text-[11px] uppercase tracking-[0.1em] text-dim">
						Shared primitives
					</p>
					<div class="flex flex-wrap gap-1.5">
						{#each primitives as primitive}
							<span
								class="rounded-full border border-line-faint bg-raised px-2.5 py-1 font-mono text-[10px] text-muted"
							>
								openschema/{primitive}
							</span>
						{/each}
					</div>
				</div>

				<ul class="flex flex-col gap-4">
					{#each points as point}
						<li>
							<p class="text-[13px] font-semibold tracking-tight text-default">{point.title}</p>
							<p class="mt-1 text-[12px] leading-relaxed text-muted">{point.desc}</p>
						</li>
					{/each}
				</ul>
			</div>
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

<script lang="ts">
	import SectionHeading from '../landing/SectionHeading.svelte';

	const steps = [
		{
			n: '01',
			title: 'Register your app',
			body: 'Create an OAuth client in the NeoWorks dashboard. Get a client ID, choose your scopes, set your redirect URIs. Five minutes to first token.',
			code: `POST /oauth/clients
{
  "name":          "My App",
  "redirect_uris": ["https://myapp.dev/callback"],
  "scopes":        ["contacts:read", "tasks:write"]
}`
		},
		{
			n: '02',
			title: 'Define your schema',
			body: 'Describe your data model in TOML. UserLayer translates it to SurrealDB DDL and enforces row-level isolation automatically — no SQL migrations to write.',
			code: `[table.tasks]
columns = [
  { name = "title",   type = "string"   },
  { name = "due_at",  type = "datetime" },
  { name = "contact", type = "string"   },
]
indexes = [
  { columns = ["user_id", "due_at"] }
]`
		},
		{
			n: '03',
			title: 'Query with full SurrealQL',
			body: 'You get a scoped JWT and direct SurrealDB access. Write joins, aggregations, live queries — anything SurrealQL supports. Row isolation is enforced at the DB layer, not yours.',
			code: `SELECT title, due_at,
  (SELECT name FROM contacts
   WHERE id = $parent.contact) AS contact
FROM tasks
WHERE user_id = $auth.id
  AND due_at > time::now()
ORDER BY due_at ASC;`
		},
		{
			n: '04',
			title: 'Ship and get paid',
			body: 'Every Pro subscriber who actively uses your app earns you a share of their €1.50 monthly split. No ad SDK. No data agreement. Revenue just shows up.',
			code: `// Dashboard API — your earnings this month
GET /v1/developer/revenue

{
  "period":       "2026-04",
  "active_users": 842,
  "payout_eur":   1263.00,
  "split_apps":   3
}`
		}
	];
</script>

<section class="border-t border-line-faint px-6 py-24 max-md:py-16">
	<div class="mx-auto max-w-[1120px]">
		<SectionHeading
			eyebrow="Getting started"
			title="From zero to shipping in an afternoon."
			subtitle="OAuth, schema, query, ship. Everything else — identity, storage, billing, device sync — is handled for you."
		/>

		<div class="mt-12 flex flex-col gap-4">
			{#each steps as step}
				<div
					class="grid grid-cols-2 items-start gap-8 rounded-2xl border border-line-faint bg-elevated/50 p-7 max-lg:grid-cols-1 max-md:p-6"
				>
					<div class="flex flex-col gap-3">
						<div class="flex items-center gap-3">
							<span class="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-dim">
								{step.n}
							</span>
							<div class="h-px flex-1 bg-line-faint"></div>
						</div>
						<h3 class="text-base font-semibold tracking-tight text-default">{step.title}</h3>
						<p class="text-sm leading-relaxed text-muted">{step.body}</p>
					</div>

					<div class="overflow-hidden rounded-xl border border-line-faint bg-raised">
						<div class="flex items-center gap-2 border-b border-line-faint px-4 py-2.5">
							<span class="size-2 rounded-full bg-line"></span>
							<span class="font-mono text-[9px] uppercase tracking-[0.1em] text-dim">Example</span>
						</div>
						<pre
							class="overflow-x-auto p-5 font-mono text-[12px] leading-relaxed text-muted"><code>{step.code}</code></pre>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<script lang="ts">
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';

	const scopes = [
		{ scope: 'contacts:read', desc: 'Read names, emails, phone numbers' },
		{ scope: 'contacts:write', desc: 'Create and update contacts' },
		{ scope: 'tasks:read', desc: 'Read task titles, due dates, status' },
		{ scope: 'tasks:write', desc: 'Create, update and complete tasks' },
		{ scope: 'events:read', desc: 'Read calendar events and availability' },
		{ scope: 'events:write', desc: 'Create and modify calendar events' },
		{ scope: 'files:read', desc: 'Read file metadata and content' },
		{ scope: 'files:write', desc: "Write files to the user's Grove" }
	];
</script>

<section class="border-t border-line-faint px-6 py-24 max-md:py-16">
	<div class="mx-auto max-w-[1120px]">
		<div class="grid grid-cols-2 items-start gap-16 max-lg:grid-cols-1 max-lg:gap-10">
			<div class="max-w-[640px]">
				<span class="font-mono text-[11px] uppercase tracking-[0.14em] text-dim">OAuth scopes</span>
				<h2
					class="mt-3 text-[clamp(28px,3.5vw,40px)] font-semibold leading-[1.05] tracking-tight text-default"
				>
					Ask for exactly what you need. Nothing more.
				</h2>
				<p class="mt-4 text-[15px] leading-relaxed text-muted">
					Standard OAuth 2.0 PKCE flow. Request the scopes your app needs — users see exactly what
					you’re asking for and can revoke access at any time.
				</p>
				<p class="mt-4 text-[15px] leading-relaxed text-muted">
					Scope violations are rejected at the SurrealDB layer — not your middleware. A stolen token
					can only do what it was granted.
				</p>
				<a
					href="/docs/neoworks/oauth"
					class="mt-6 inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-hover hover:text-default"
				>
					OAuth integration guide
					<ArrowRightIcon size={14} weight="bold" />
				</a>
			</div>

			<div class="flex flex-col gap-2">
				{#each scopes as { scope, desc }}
					<div
						class="flex items-center gap-3 rounded-xl border border-line-faint bg-elevated/50 px-4 py-3"
					>
						<span
							class="shrink-0 rounded-md border border-line-faint bg-raised px-2 py-1 font-mono text-[10px] text-default"
						>
							{scope}
						</span>
						<span class="text-[12px] text-muted">{desc}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

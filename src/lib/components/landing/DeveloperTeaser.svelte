<script lang="ts">
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import FingerprintIcon from 'phosphor-svelte/lib/FingerprintIcon';
	import CodeIcon from 'phosphor-svelte/lib/CodeIcon';
	import ReceiptIcon from 'phosphor-svelte/lib/ReceiptIcon';

	const features = [
		{ label: 'OAuth + scopes', Icon: FingerprintIcon },
		{ label: 'Schema-as-config data layer', Icon: CodeIcon },
		{ label: 'Pass-through billing + revenue share', Icon: ReceiptIcon }
	];

	const snippet = `POST /oauth/clients
{
  "name":          "My App",
  "redirect_uris": ["https://myapp.dev/callback"],
  "scopes":        ["contacts:read", "tasks:write"]
}`;
</script>

<section class="border-t border-line-faint px-6 py-24 max-md:py-16">
	<div
		class="mx-auto grid max-w-[1120px] grid-cols-2 items-center gap-12 rounded-3xl border border-line bg-elevated/60 p-10 max-lg:grid-cols-1 max-md:p-7"
	>
		<!-- Copy -->
		<div>
			<span class="font-mono text-[11px] uppercase tracking-[0.14em] text-dim">For developers</span>
			<h2
				class="mt-3 text-[clamp(26px,3.2vw,36px)] font-semibold leading-[1.05] tracking-tight text-default"
			>
				A user-owned backend you can build on.
			</h2>
			<p class="mt-4 max-w-[440px] text-[15px] leading-relaxed text-muted">
				Register an OAuth client, define your schema, and get scoped, row-isolated database
				access in minutes. Your users bring their own encrypted storage — so you skip building
				auth, sync, and a data layer.
			</p>

			<ul class="mt-6 flex flex-col gap-2.5">
				{#each features as { label, Icon }}
					<li class="flex items-center gap-2.5 text-sm text-muted">
						<span
							class="flex size-7 shrink-0 items-center justify-center rounded-lg border border-line-faint bg-raised text-dim"
						>
							<Icon size={15} weight="duotone" />
						</span>
						{label}
					</li>
				{/each}
			</ul>

			<div class="mt-8 flex flex-wrap items-center gap-3">
				<a
					href="/developers"
					class="flex items-center gap-2 rounded-full bg-action px-5 py-2.5 text-sm font-semibold text-action-fg transition-opacity hover:opacity-90 active:scale-[0.98]"
				>
					Read the developer docs
					<ArrowRightIcon size={15} weight="bold" />
				</a>
				<a
					href="/docs"
					class="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-hover hover:text-default"
				>
					Quickstart
				</a>
			</div>
		</div>

		<!-- Code sample -->
		<div class="overflow-hidden rounded-2xl border border-line bg-surface">
			<div class="flex items-center gap-2 border-b border-line-faint px-4 py-3">
				<span class="size-2.5 rounded-full bg-line-strong"></span>
				<span class="size-2.5 rounded-full bg-line-strong"></span>
				<span class="size-2.5 rounded-full bg-line-strong"></span>
				<span class="ml-2 font-mono text-[11px] text-dim">register a client</span>
			</div>
			<pre class="overflow-x-auto p-5 font-mono text-[12.5px] leading-relaxed text-muted"><code
					>{snippet}</code
				></pre>
		</div>
	</div>
</section>

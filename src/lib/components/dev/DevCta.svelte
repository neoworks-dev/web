<script lang="ts">
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
</script>

<section class="relative overflow-hidden border-t border-line-faint px-6 py-28 max-md:py-20">
	<div
		class="pegboard pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
	></div>

	<div class="relative mx-auto max-w-[640px] text-center">
		<h2 class="text-[clamp(30px,4vw,48px)] font-semibold leading-[1.02] tracking-tight text-default">
			Ship in an afternoon.
		</h2>
		<p class="mx-auto mt-5 max-w-[460px] text-[15px] leading-relaxed text-muted">
			Register an OAuth client, point it at a schema, and start reading and writing real user data —
			encrypted media and queryable records — in minutes.
		</p>

		<div class="mt-8 flex flex-wrap items-center justify-center gap-3">
			<a
				href="/signup?type=developer"
				class="flex items-center gap-2 rounded-full bg-action px-5 py-2.5 text-sm font-semibold text-action-fg transition-opacity hover:opacity-90 active:scale-[0.98]"
			>
				Register your app
				<ArrowRightIcon size={15} weight="bold" />
			</a>
			<a
				href="/docs"
				class="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-hover hover:text-default"
			>
				Read the docs
			</a>
		</div>

		<p class="mt-8 font-mono text-[10px] uppercase tracking-[0.1em] text-faint">
			OAuth 2.0 · OpenSchema · SurrealDB · Revenue share
		</p>
	</div>
</section>

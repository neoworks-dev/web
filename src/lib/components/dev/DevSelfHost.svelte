<script lang="ts">
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
</script>

<section class="border-t border-line-faint px-6 py-24 max-md:py-16">
	<div class="mx-auto max-w-[1120px]">
		<div
			class="grid grid-cols-3 items-center gap-10 rounded-2xl border border-line-faint bg-elevated/50 p-8 max-md:grid-cols-1 max-md:p-7"
		>
			<div class="col-span-2 max-md:col-span-1">
				<span class="font-mono text-[11px] uppercase tracking-[0.14em] text-dim">Open source</span>
				<h2 class="mt-3 text-2xl font-semibold tracking-tight text-default">
					Build on something you can fork.
				</h2>
				<p class="mt-3 text-sm leading-relaxed text-muted">
					NeoWorks is source-available under CC BY-NC-SA. Read the source, fork it, and run your own
					node — share your changes alike. You’re never locked into our infrastructure. The one
					thing the license rules out is reselling NeoWorks as a commercial platform of your own.
				</p>
			</div>
			<div class="flex flex-col gap-3">
				<a
					href="https://github.com/neoworks-io"
					target="_blank"
					rel="noopener noreferrer"
					class="flex items-center justify-center gap-1.5 rounded-full border border-line px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-hover hover:text-default"
				>
					View on GitHub
					<ArrowRightIcon size={14} weight="bold" />
				</a>
				<a
					href="/docs/neoworks/self-host"
					class="flex items-center justify-center gap-1.5 rounded-full border border-line px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-hover hover:text-default"
				>
					Self-hosting guide
					<ArrowRightIcon size={14} weight="bold" />
				</a>
			</div>
		</div>
	</div>
</section>

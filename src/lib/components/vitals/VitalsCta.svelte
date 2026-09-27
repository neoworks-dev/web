<script lang="ts">
	import ArrowSquareOutIcon from 'phosphor-svelte/lib/ArrowSquareOutIcon';
	import GithubLogoIcon from 'phosphor-svelte/lib/GithubLogoIcon';
	import ProhibitIcon from 'phosphor-svelte/lib/ProhibitIcon';
	import { vitals } from '$lib/vitals';

	const omissions = [
		'No editing tools — the agent already has them.',
		'No memory or project-context store; that belongs in the repo’s own instructions file.',
		'No LLM-generated summaries, which go stale while the source does not.',
		'No embeddings: search is BM25 over identifiers, and that is the whole of it.',
		'No statistics about itself in the output — no node counts, no “tokens saved” line, no speed claim.'
	];
</script>

<section id="omissions" class="scroll-mt-32 border-t border-line-faint px-6 py-24 max-md:py-16">
	<div class="mx-auto max-w-[1120px]">
		<div class="grid gap-4 lg:grid-cols-[1fr_1fr]">
			<div class="rounded-2xl border border-line-faint bg-elevated/50 p-6">
				<span
					class="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line-faint bg-raised text-muted"
				>
					<ProhibitIcon size={22} weight="duotone" />
				</span>
				<h2 class="mt-4 text-[clamp(22px,2.4vw,28px)] font-semibold tracking-tight text-default">
					What it deliberately does not do
				</h2>
				<ul class="mt-4 flex flex-col gap-2.5">
					{#each omissions as omission}
						<li class="text-sm leading-relaxed text-muted">{omission}</li>
					{/each}
				</ul>
				<p class="mt-4 text-sm leading-relaxed text-muted">
					Numbers belong in <a
						href="#benchmark"
						class="text-default underline decoration-line underline-offset-2">the benchmark</a
					>, where they can be checked.
				</p>
			</div>

			<div
				class="flex flex-col items-center justify-center gap-5 rounded-2xl border border-line-faint bg-elevated/50 px-6 py-14 text-center"
			>
				<h2
					class="max-w-[460px] text-[clamp(26px,3.2vw,38px)] leading-[1.08] font-semibold tracking-tight text-default"
				>
					Stop paying for the same answer twice.
				</h2>
				<p class="max-w-[420px] text-sm leading-relaxed text-muted">
					MIT, no account, nothing to sign up for. Clone it, point your agent at it, and read every
					claim it makes back to a <span class="font-mono text-[13px]">file:line</span>.
				</p>
				<div class="flex flex-wrap items-center justify-center gap-3">
					<a
						href={vitals.sourceUrl}
						class="inline-flex items-center gap-2 rounded-full bg-action px-6 py-3 text-base font-semibold text-action-fg transition-opacity hover:opacity-90 active:scale-[0.98]"
					>
						<GithubLogoIcon size={17} weight="fill" />
						Get vitals
					</a>
					<a
						href={vitals.designNotesUrl}
						class="inline-flex items-center gap-2 rounded-full border border-line bg-elevated/60 px-5 py-3 text-sm font-medium text-muted transition-colors hover:bg-hover hover:text-default"
					>
						Design notes
						<ArrowSquareOutIcon size={15} weight="bold" />
					</a>
				</div>
				<p class="font-mono text-[11px] tracking-[0.14em] text-dim uppercase">
					MIT · Bun ≥ 1.2 · No API key
				</p>
			</div>
		</div>
	</div>
</section>

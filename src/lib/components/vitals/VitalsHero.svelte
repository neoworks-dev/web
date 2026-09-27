<script lang="ts">
	import ArrowSquareOutIcon from 'phosphor-svelte/lib/ArrowSquareOutIcon';
	import TerminalIcon from 'phosphor-svelte/lib/TerminalIcon';
	import TranscriptSplit from './TranscriptSplit.svelte';
	import { vitals } from '$lib/vitals';

	// Both transcripts answer the same question — "what is Lexer and who uses it"
	// — on the benchmark's repo. The vitals side is real output from the README;
	// the grep side is the shape of the control arm's tool log.
	const grepTranscript = `$ grep -rn "Lexer" internal/
  412 matches in 38 files

$ read internal/lexer/lexer.go
  1,284 lines

$ grep -rn "l.Next()" internal/
  61 matches in 9 files

$ read internal/parser/parser.go
  903 lines

$ read internal/token/token.go
  402 lines

$ read internal/cmd/gyro.go
  611 lines
  … still guessing which hits are calls`;

	const vitalsTranscript = `$ vitals explore internal/lexer.Lexer

## type …/internal/lexer.Lexer — internal/lexer/lexer.go:23
23	type Lexer struct {
24		file *diag.File
25		src  string
26		bag  *diag.Bag
…

## references (22)
internal/lexer/lexer.go:40  [lsp.references/certain]
internal/lexer/lexer.go:64  [lsp.references/certain]
internal/parser/parser.go:31  [lsp.references/certain]
…

## reaching tests
none within 3 caller hops`;
</script>

<section class="border-b border-line-faint px-6 pt-36 pb-20 max-md:pt-28 max-md:pb-14">
	<div class="mx-auto max-w-[1180px]">
		<p class="font-mono text-[11px] tracking-[0.14em] text-dim uppercase">
			MIT · No model · Nothing written into your repo
		</p>

		<h1
			class="mt-4 max-w-[760px] text-[clamp(32px,4.2vw,54px)] leading-[1.04] font-semibold tracking-tight text-default"
		>
			The vital tools your coding agent has always needed.
		</h1>

		<p class="mt-5 max-w-[620px] text-[clamp(15px,1.6vw,18px)] leading-relaxed text-muted">
			One engine, five answers, no model in the loop. Your agent asks how the repo is put
			together, who breaks if it changes this, and whether the rename is complete — and rebuilds
			every answer out of grep hits, in your context window, every session.
		</p>

		<div class="mt-8 flex flex-wrap items-center gap-3">
			<a
				href="#install"
				class="inline-flex items-center gap-2 rounded-full bg-action px-6 py-3 text-base font-semibold text-action-fg transition-opacity hover:opacity-90 active:scale-[0.98]"
			>
				<TerminalIcon size={17} weight="bold" />
				Add it to your agent
			</a>
			<a
				href={vitals.sourceUrl}
				class="inline-flex items-center gap-2 rounded-full border border-line bg-elevated/60 px-5 py-3 text-sm font-medium text-muted transition-colors hover:bg-hover hover:text-default"
			>
				View source
				<ArrowSquareOutIcon size={15} weight="bold" />
			</a>
		</div>

		<div class="mt-12">
			<TranscriptSplit
				label="Compare an agent working with grep against the same agent with vitals"
				left={{
					label: 'Grep only',
					body: grepTranscript,
					stats: ['63,675 bytes read', '24,020 tokens']
				}}
				right={{
					label: 'With vitals',
					body: vitalsTranscript,
					stats: ['22,669 bytes read', '17,600 tokens']
				}}
			/>
		</div>

		<p class="mt-5 max-w-[720px] text-[13px] leading-relaxed text-dim">
			Figures are the mean per task over seven discovery tasks on the
			<span class="font-mono text-[12px]">gyro</span> compiler — same agent, same model, same
			repo, one arm wired to vitals. Both arms answered 7 of 7 correctly, and the vitals arm was
			the slower one.
			<a href="#benchmark" class="text-muted underline decoration-line underline-offset-2">
				The whole table, including where it loses.
			</a>
		</p>
	</div>
</section>

<script lang="ts">
	import ArrowSquareOutIcon from 'phosphor-svelte/lib/ArrowSquareOutIcon';
	import { vitals } from '$lib/vitals';

	type Row = {
		metric: string;
		control: string;
		withVitals: string;
		delta: string;
		/** Whether the vitals arm won this row — the losses are not styled as wins. */
		favourable: boolean;
	};

	const rows: Row[] = [
		{ metric: 'Correct', control: '7 / 7', withVitals: '7 / 7', delta: 'equal', favourable: false },
		{ metric: 'Tokens', control: '24,020', withVitals: '17,600', delta: '−27%', favourable: true },
		{
			metric: 'Tool-result bytes',
			control: '63,675',
			withVitals: '22,669',
			delta: '−64%',
			favourable: true
		},
		{ metric: 'Tool calls', control: '6.4', withVitals: '7.9', delta: '+1.5', favourable: false },
		{ metric: 'Seconds', control: '24.6', withVitals: '32.5', delta: '+7.9', favourable: false }
	];

	function deltaClass(favourable: boolean): string {
		if (favourable) return 'text-green';
		return 'text-dim';
	}
</script>

<div class="overflow-hidden rounded-2xl border border-line-faint bg-elevated/50">
	<table class="w-full text-left text-sm">
		<thead>
			<tr class="border-b border-line-faint">
				<th class="px-5 py-3 font-mono text-[11px] tracking-[0.14em] text-dim uppercase max-md:px-4">
					Mean per task
				</th>
				<th class="px-5 py-3 font-mono text-[11px] tracking-[0.14em] text-dim uppercase max-md:px-4">
					Grep only
				</th>
				<th class="px-5 py-3 font-mono text-[11px] tracking-[0.14em] text-dim uppercase max-md:px-4">
					With vitals
				</th>
				<th class="px-5 py-3 font-mono text-[11px] tracking-[0.14em] text-dim uppercase max-md:px-4"
				></th>
			</tr>
		</thead>
		<tbody>
			{#each rows as row (row.metric)}
				<tr class="border-b border-line-faint last:border-0">
					<td class="px-5 py-3 text-muted max-md:px-4">{row.metric}</td>
					<td class="px-5 py-3 font-mono text-[13px] text-muted max-md:px-4">{row.control}</td>
					<td class="px-5 py-3 font-mono text-[13px] font-semibold text-default max-md:px-4">
						{row.withVitals}
					</td>
					<td class="px-5 py-3 font-mono text-[13px] max-md:px-4 {deltaClass(row.favourable)}">
						{row.delta}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<div class="mt-6 grid gap-4 md:grid-cols-2">
	<div class="rounded-2xl border border-line-faint bg-elevated/50 p-6">
		<h3 class="text-base font-semibold tracking-tight text-default">Nobody was wrong</h3>
		<p class="mt-1.5 text-sm leading-relaxed text-muted">
			On discovery questions a good model with grep can already answer, an index does not buy
			correctness — it buys how much the agent had to read to get there, and that is context you
			keep for the actual task. vitals is the slower arm, because a language server has to be ready
			before it will claim anything.
		</p>
	</div>

	<div class="rounded-2xl border border-line-faint bg-elevated/50 p-6">
		<h3 class="text-base font-semibold tracking-tight text-default">
			The gap widens where grep stops being enough
		</h3>
		<p class="mt-1.5 text-sm leading-relaxed text-muted">
			Two of the seven tasks are about <span class="font-mono text-[13px]">.gyro</span> source, a
			language nothing has a grammar for off the shelf: there vitals answered on 9,987 tokens and
			6,297 bytes against grep’s 18,695 and 44,160 — same answers, 7× less material read. It was
			taught the language by dropping in a compiled grammar, with no change to vitals itself.
		</p>
	</div>
</div>

<p class="mt-6 text-[13px] leading-relaxed text-dim">
	Correctness is a required-keyword floor fixed before either arm ran, not a judge — a fluent wrong
	answer cannot win by being fluent. Every number is an observed count from the agent’s own event
	stream, not a saving against a hypothetical baseline.
	<a
		href={vitals.benchmarkUrl}
		class="inline-flex items-center gap-1 text-muted underline decoration-line underline-offset-2"
	>
		The task set, grading keywords and disclosures
		<ArrowSquareOutIcon size={12} weight="bold" />
	</a>
	— including one task that is in there because vitals was expected to lose it.
</p>

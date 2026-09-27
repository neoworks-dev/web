<script lang="ts">
	import type { Component } from 'svelte';
	import FileTextIcon from 'phosphor-svelte/lib/FileTextIcon';
	import HandPalmIcon from 'phosphor-svelte/lib/HandPalmIcon';
	import HardDrivesIcon from 'phosphor-svelte/lib/HardDrivesIcon';
	import ProhibitIcon from 'phosphor-svelte/lib/ProhibitIcon';
	import SealCheckIcon from 'phosphor-svelte/lib/SealCheckIcon';
	import WarningIcon from 'phosphor-svelte/lib/WarningIcon';

	type Bet = {
		title: string;
		body: string;
		icon: Component;
	};

	const bets: Bet[] = [
		{
			title: 'Compiler-backed by default',
			body: 'References, callers and renames come from a language server. The declaration index is the fallback, and it is labelled as one: a hit a grammar found is [lexical/possible], never dressed up as a fact.',
			icon: SealCheckIcon
		},
		{
			title: 'No model, anywhere, ever',
			body: 'Nothing here calls an LLM — not to build, not to answer. No key to configure, no bill for indexing, no prose that was true at build time and is quietly wrong now.',
			icon: ProhibitIcon
		},
		{
			title: 'Nothing is written into your repo',
			body: 'No index directory, no .gitignore line, no artifact a teammate can commit stale. The store lives in your cache directory, keyed by file hash, and invalidates per file on content change.',
			icon: HardDrivesIcon
		},
		{
			title: 'The answer, not the graph',
			body: 'Top hits print the definition body, line-numbered and byte-identical to your agent’s file-read tool. Measured: answers carrying bodies landed in two or three turns where a bare ranked list took seven to nine.',
			icon: FileTextIcon
		},
		{
			title: 'Degraded answers admit it',
			body: 'A missing language server, a traversal that hit its cap, a reference set that is a lower bound — that is the first line of the answer, and it is never truncated away.',
			icon: WarningIcon
		},
		{
			title: 'It refuses rather than half-finishing',
			body: 'rename unions one rename request per referencing file and aborts if a single known reference is still uncovered. The one edit a text tool cannot do safely is the one edit vitals owns.',
			icon: HandPalmIcon
		}
	];
</script>

<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
	{#each bets as bet (bet.title)}
		<div class="flex flex-col gap-4 rounded-2xl border border-line-faint bg-elevated/50 p-6">
			<span
				class="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line-faint bg-raised text-muted"
			>
				<bet.icon size={22} weight="duotone" />
			</span>
			<div>
				<h3 class="text-base font-semibold tracking-tight text-default">{bet.title}</h3>
				<p class="mt-1.5 text-sm leading-relaxed text-muted">{bet.body}</p>
			</div>
		</div>
	{/each}
</div>

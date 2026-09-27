<script lang="ts">
	import type { Component } from 'svelte';
	import CheckIcon from 'phosphor-svelte/lib/CheckIcon';
	import CodeIcon from 'phosphor-svelte/lib/CodeIcon';
	import TextAaIcon from 'phosphor-svelte/lib/TextAaIcon';
	import TreeStructureIcon from 'phosphor-svelte/lib/TreeStructureIcon';

	type Tier = {
		title: string;
		languages: string;
		body: string;
		answers: string[];
		icon: Component;
	};

	const tiers: Tier[] = [
		{
			title: 'Out of the box',
			languages: 'TypeScript · Svelte',
			body: 'Both language servers ship as dependencies, so nothing has to be added to the project under analysis. A project-local server is always preferred when one exists — a repo pinned to an older TypeScript must be analysed by that TypeScript.',
			answers: ['Compiler-backed references, callers and renames', 'Everything below, too'],
			icon: CodeIcon
		},
		{
			title: 'Declaration index',
			languages: 'Go · C · Rust · anything with a tree-sitter grammar',
			body: 'You get the structural answers without a language server. Add one to your PATH for that language and the semantic answers switch on — the client is generic.',
			answers: ['map’s layout section', 'search', 'explore on files and directories'],
			icon: TreeStructureIcon
		},
		{
			title: 'Bring a grammar',
			languages: 'Your own language',
			body: 'A language nobody ships a grammar for is a WASM build and a tags query dropped in VITALS_GRAMMAR_DIR. That is how the benchmark taught it .gyro — seven rules, no change to vitals.',
			answers: ['Everything the declaration index gives'],
			icon: TextAaIcon
		}
	];
</script>

<div class="grid gap-4 md:grid-cols-3">
	{#each tiers as tier (tier.title)}
		<div class="flex flex-col gap-4 rounded-2xl border border-line-faint bg-elevated/50 p-6">
			<span
				class="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line-faint bg-raised text-muted"
			>
				<tier.icon size={22} weight="duotone" />
			</span>
			<div>
				<h3 class="text-base font-semibold tracking-tight text-default">{tier.title}</h3>
				<p class="mt-1 font-mono text-[11.5px] text-dim">{tier.languages}</p>
				<p class="mt-2.5 text-sm leading-relaxed text-muted">{tier.body}</p>
			</div>
			<ul class="mt-auto flex flex-col gap-2">
				{#each tier.answers as answer}
					<li class="flex items-start gap-2.5 text-sm leading-relaxed text-muted">
						<CheckIcon size={15} weight="bold" class="mt-1 shrink-0 text-green" />
						{answer}
					</li>
				{/each}
			</ul>
		</div>
	{/each}
</div>

<div class="mt-4 rounded-2xl border border-line-faint bg-elevated/50 p-6">
	<h3 class="text-base font-semibold tracking-tight text-default">
		TypeScript 7 (<span class="font-mono text-[15px]">tsgo</span>) is there, and it is not the default
	</h3>
	<p class="mt-1.5 max-w-[860px] text-sm leading-relaxed text-muted">
		On a 23-package monorepo the same <span class="font-mono text-[13px]">explore</span> took 1.6s
		instead of 16.4s and found 15 callers where the classic server found 2 — it keeps one
		workspace-wide project graph, so nothing has to be primed into view. It also panicked part-way
		through that run, and it renames an exported symbol by leaving an alias behind, so
		<span class="font-mono text-[13px]">rename</span> routes to the classic server even when tsgo is
		selected.
	</p>
</div>

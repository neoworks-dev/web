<script lang="ts">
	import ArrowSquareOutIcon from 'phosphor-svelte/lib/ArrowSquareOutIcon';
	import CopyBlock from './CopyBlock.svelte';
	import { mcpServerConfig, vitals } from '$lib/vitals';

	const quickstart = `bun install
bun run src/cli.ts map -C /path/to/your/project`;

	const statusline = `◤ vitals · ✗ 2 new errors · ts ✓ svelte ✓ · 14s ago
▸ ctx 42% · last: vitals working tree vs HEAD`;

	type CliEntry = {
		usage: string;
		answers: string;
	};

	const cliReference: CliEntry[] = [
		{ usage: 'vitals map', answers: 'project layout, entry points, hubs, test commands' },
		{ usage: 'vitals search <words…>', answers: 'plain-words question: ranked places to look' },
		{
			usage: 'vitals explore <target>',
			answers: 'symbol: source, references, callers, calls, tests'
		},
		{ usage: 'vitals rename <target> <name>', answers: 'rename a symbol across the workspace' },
		{ usage: 'vitals [scope]', answers: 'changed surface, impact, tests, diagnostics' }
	];
</script>

<div class="grid gap-4 lg:grid-cols-2">
	<div class="flex min-w-0 flex-col gap-4">
		<div class="rounded-2xl border border-line-faint bg-elevated/50 p-6">
			<h3 class="text-base font-semibold tracking-tight text-default">
				1 · See what your agent will see
			</h3>
			<p class="mt-1.5 text-sm leading-relaxed text-muted">
				No indexing step, no daemon, no config file, no API key — there is no model to give a key
				to. The first call builds what it needs and caches it in
				<span class="font-mono text-[13px]">$XDG_CACHE_HOME</span>, outside your repository.
			</p>
			<div class="mt-4">
				<CopyBlock code={quickstart} caption="Quickstart" />
			</div>
		</div>

		<div class="rounded-2xl border border-line-faint bg-elevated/50 p-6">
			<h3 class="text-base font-semibold tracking-tight text-default">2 · Point your agent at it</h3>
			<p class="mt-1.5 text-sm leading-relaxed text-muted">
				One MCP block, five tools. The server keeps one engine alive for the whole session, which is
				what makes repeat calls cheap: language servers stay warm and loaded projects stay loaded.
			</p>
			<div class="mt-4">
				<CopyBlock code={mcpServerConfig} caption="mcp.json" />
			</div>
		</div>
	</div>

	<div class="flex min-w-0 flex-col gap-4">
		<div class="overflow-hidden rounded-2xl border border-line-faint bg-elevated/50">
			<p
				class="border-b border-line-faint px-5 py-3 font-mono text-[11px] tracking-[0.14em] text-dim uppercase max-md:px-4"
			>
				The same engine on the CLI
			</p>
			<table class="w-full text-left text-sm">
				<tbody>
					{#each cliReference as entry (entry.usage)}
						<tr class="border-b border-line-faint last:border-0">
							<td class="px-5 py-3 align-top font-mono text-[12.5px] text-default max-md:px-4">
								{entry.usage}
							</td>
							<td class="px-5 py-3 align-top leading-relaxed text-muted max-md:px-4">
								{entry.answers}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="rounded-2xl border border-line-faint bg-elevated/50 p-6">
			<h3 class="text-base font-semibold tracking-tight text-default">Optional: the status line</h3>
			<p class="mt-1.5 text-sm leading-relaxed text-muted">
				A two-line bar for Claude Code showing the verdict of your last change and the health of the
				language servers. It reads one small JSON file — no database, no language server, no git —
				and runs in ~24ms. Already have a status line? Chain it rather than replacing it.
			</p>
			<pre
				class="mt-4 overflow-x-auto rounded-xl border border-line bg-[#0b0d10] px-4 py-3 font-mono text-[12.5px] leading-[1.7] text-white/75">{statusline}</pre>
		</div>

		<div class="rounded-2xl border border-line-faint bg-elevated/50 p-6">
			<h3 class="text-base font-semibold tracking-tight text-default">Optional: the post-edit hook</h3>
			<p class="mt-1.5 text-sm leading-relaxed text-muted">
				<span class="font-mono text-[13px]">vitals --diagnostics</span> prints nothing when the diff
				introduced no errors, and only the introduced errors when it did. That is the one push this
				tool permits: silent when green, errors only, never a summary. Nothing is installed for you.
			</p>
			<a
				href={vitals.readmeUrl}
				class="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-default transition-opacity hover:opacity-70"
			>
				Full configuration reference
				<ArrowSquareOutIcon size={13} weight="bold" />
			</a>
		</div>
	</div>
</div>

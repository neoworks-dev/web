<script lang="ts">
	type Resolver = {
		name: string;
		means: string;
	};

	const resolvers: Resolver[] = [
		{ name: 'lsp.callHierarchy', means: 'The compiler resolved a call.' },
		{ name: 'lsp.references', means: 'The compiler resolved a reference — not proof of a call.' },
		{ name: 'lsp.rename', means: 'Part of the language server’s rename edit set.' },
		{ name: 'module.imports', means: 'A module imports another module. Says nothing about symbols.' },
		{
			name: 'route.sveltekit',
			means: 'A framework convention: load → page data, form action → component, URL string → endpoint.'
		},
		{ name: 'graph.callerHops', means: 'A multi-hop walk over resolved call edges.' },
		{ name: 'lexical', means: 'A grammar saw a matching word. Not a resolution.' }
	];

	type Confidence = {
		name: string;
		means: string;
		tone: string;
	};

	const confidences: Confidence[] = [
		{ name: 'certain', means: 'A compiler said so.', tone: 'text-green' },
		{ name: 'likely', means: 'A rule matched with one candidate.', tone: 'text-amber' },
		{
			name: 'possible',
			means: 'Several candidates, or a convention that is usually true.',
			tone: 'text-dim'
		}
	];
</script>

<div class="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
	<div class="overflow-hidden rounded-2xl border border-line-faint bg-elevated/50">
		<p
			class="border-b border-line-faint px-5 py-3 font-mono text-[11px] tracking-[0.14em] text-dim uppercase max-md:px-4"
		>
			Every edge says how it was resolved
		</p>
		<table class="w-full text-left text-sm">
			<tbody>
				{#each resolvers as resolver (resolver.name)}
					<tr class="border-b border-line-faint last:border-0">
						<td class="px-5 py-3 align-top font-mono text-[12.5px] text-default max-md:px-4">
							{resolver.name}
						</td>
						<td class="px-5 py-3 align-top leading-relaxed text-muted max-md:px-4">
							{resolver.means}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="flex flex-col gap-4">
		<div class="rounded-2xl border border-line-faint bg-elevated/50 p-6">
			<p class="font-mono text-[11px] tracking-[0.14em] text-dim uppercase">…and a confidence</p>
			<ul class="mt-4 flex flex-col gap-3">
				{#each confidences as confidence (confidence.name)}
					<li class="text-sm leading-relaxed text-muted">
						<span class="font-mono text-[12.5px] {confidence.tone}">{confidence.name}</span>
						— {confidence.means}
					</li>
				{/each}
			</ul>
		</div>

		<div class="rounded-2xl border border-line-faint bg-elevated/50 p-6">
			<h3 class="text-base font-semibold tracking-tight text-default">
				Caveats come first and are never truncated
			</h3>
			<p class="mt-1.5 text-sm leading-relaxed text-muted">
				A degraded answer that admits it is useful; one that does not is a trap. Every claim also
				carries its <span class="font-mono text-[13px]">file:line</span>, so your agent can check it
				instead of trusting it.
			</p>
		</div>
	</div>
</div>

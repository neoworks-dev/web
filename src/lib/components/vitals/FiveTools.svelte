<script lang="ts">
	type Tool = {
		id: string;
		label: string;
		question: string;
		command: string;
		/** Real output, trimmed with `…` where it ran long. */
		output: string;
		note: string;
	};

	const tools: Tool[] = [
		{
			id: 'map',
			label: 'map',
			question: 'How is this project put together?',
			command: 'vitals map',
			output: `## packages (1, go)
.  github.com/gyro-lang/gyro  ·  go

## entry points
.: cli gyro -> main.go

## layout — declaration index, hubs by name mentions [lexical/possible]
internal/cc/     31 files  523 decls  hubs: funcLowerer lower.go:489 (224)
internal/metals/ 12 files  441 decls  hubs: Func metals.go:539 (111)
internal/sema/   22 files  393 decls  hubs: checker sema.go:181 (232)
internal/lower/  13 files  293 decls  hubs: funcLowerer func.go:18 (224)
…

## tests
.: 89 test files in internal, tests · go · go test ./...

## project instructions
CLAUDE.md`,
			note: 'Packages come from whichever manifest the repo has — package.json, go.mod, Cargo.toml, pyproject.toml, CMakeLists.txt. No generated prose.'
		},
		{
			id: 'search',
			label: 'search',
			question: 'Where is the code about this, when I do not know its name?',
			command: 'vitals search "where is the effect annotation parsed"',
			output: `## caveats
- lexical-only: candidates are name and path matches ranked by relevance, not
  resolved symbols — explore one of them for compiler-backed references

## candidates for "where is the effect annotation parsed" (12)
internal/sema/effect.go       file    [lexical/possible]  package sema
internal/sema/effect.go:31    effectSet       type    type effectSet struct {
internal/parser/decl.go:382   parseEffectRow  method  func (p *Parser) parse…
internal/ast/ast.go:142       EffectRow       type    type EffectRow struct {
…

## parseEffectRow — internal/parser/decl.go:382-410
382	func (p *Parser) parseEffectRow() *ast.EffectRow {
383		if !p.at(token.Bang) {
384			return nil
385		}
…`,
			note: 'BM25 over one document per declaration, subword-tokenized, so submitContactForm matches "submit contact form". No embeddings. The top hits carry their definition body, because a ranked list is always followed by a read.'
		},
		{
			id: 'explore',
			label: 'explore',
			question: 'Where is X, who uses it, what does it call, what tests reach it?',
			command: 'vitals explore internal/lexer.Lexer',
			output: `## type github.com/gyro-lang/gyro/internal/lexer.Lexer — internal/lexer/lexer.go:23
23	type Lexer struct {
24		file *diag.File
25		src  string
26		bag  *diag.Bag
27
28		// offset is the byte index of the character in ch.
29		offset int
…

## references (22)
internal/lexer/lexer.go:40   [lsp.references/certain]  func New(file *diag.File…
internal/lexer/lexer.go:64   [lsp.references/certain]  func (l *Lexer) advance()
internal/lexer/lexer.go:102  [lsp.references/certain]  func (l *Lexer) Next() …
…

## reaching tests
none within 3 caller hops`,
			note: 'The source is byte-identical to your agent’s file-read tool, so this replaces the read rather than adding to it. Ambiguity is reported, never guessed.'
		},
		{
			id: 'rename',
			label: 'rename',
			question: 'Rename this symbol everywhere, correctly — or refuse.',
			command: 'vitals rename src/tools/explore.ts:334 DECLS_PER_FILE --dry-run',
			output: `## would rename DECLARATIONS_PER_FILE -> DECLS_PER_FILE: 4 location(s) in 1 file(s)
src/tools/explore.ts:334  [lsp.rename/certain]
src/tools/explore.ts:360  [lsp.rename/certain]
src/tools/explore.ts:362  [lsp.rename/certain]
src/tools/explore.ts:362  [lsp.rename/certain]`,
			note: 'A rename anchored at the declaration only collects locations in the project that owns the anchor — measured: 4 in 3 files, where references found 6 in 4. So vitals issues one rename per referencing file, unions the edits, and aborts if a single known reference is still uncovered.'
		},
		{
			id: 'vitals',
			label: 'vitals',
			question: 'I changed this. What breaks, what tests, what does the typechecker say?',
			command: 'vitals',
			output: `## caveats
- impact-capped: impact traversal stopped at depth 2 or its node cap
- diagnostics-uncompared: 1 file(s) had no base revision to compare against

## surface — whole file src/tools/explore.ts
src/tools/explore.ts:85   function runExplore        signature L85-255
src/tools/explore.ts:282  function exploreFile       signature L282-331
…

## impact (depth 2, 5 dependants outside the diff)
src/cli.ts:142           d1 call src.cli.ts   [lsp.callHierarchy/certain]
src/index.ts:13          d1 usage (module scope)  [lsp.references/certain]
src/tools/search.ts:148  d2 call runSearch    [lsp.callHierarchy/certain]

## test coverage
ExploreOptions, … +9: tests/e2e.test.ts, tests/output.test.ts

## run
bun test tests/e2e.test.ts tests/output.test.ts`,
			note: 'Errors introduced by this diff, separated from errors already present at the base revision. On a codebase whose gate is already red, that distinction is the whole question.'
		}
	];

	let activeId = $state(tools[0].id);

	function toolById(id: string): Tool {
		const match = tools.find((tool) => tool.id === id);
		if (match) return match;
		return tools[0];
	}

	const active = $derived(toolById(activeId));

	function tabClass(id: string): string {
		if (id === activeId) return 'border-default text-default';
		return 'border-transparent text-dim hover:text-muted';
	}

	function tabIndexFor(id: string): number {
		if (id === activeId) return 0;
		return -1;
	}

	function selectTab(index: number): void {
		const wrapped = (index + tools.length) % tools.length;
		activeId = tools[wrapped].id;
		const tab = document.getElementById(`tool-tab-${tools[wrapped].id}`);
		if (tab) tab.focus();
	}

	function onTabKey(event: KeyboardEvent, index: number): void {
		if (event.key === 'ArrowRight') selectTab(index + 1);
		else if (event.key === 'ArrowLeft') selectTab(index - 1);
		else return;
		event.preventDefault();
	}
</script>

<div class="overflow-hidden rounded-2xl border border-line bg-[#0b0d10]">
	<div
		role="tablist"
		aria-label="The five vitals tools"
		class="flex flex-wrap items-center gap-1 border-b border-white/10 px-3"
	>
		{#each tools as tool, index (tool.id)}
			<button
				type="button"
				role="tab"
				id="tool-tab-{tool.id}"
				aria-selected={tool.id === activeId}
				aria-controls="tool-panel"
				tabindex={tabIndexFor(tool.id)}
				onclick={() => (activeId = tool.id)}
				onkeydown={(event) => onTabKey(event, index)}
				class="-mb-px shrink-0 border-b-2 px-3 py-3 font-mono text-[13px] transition-colors {tabClass(
					tool.id
				)}"
			>
				{tool.label}
			</button>
		{/each}
	</div>

	<div class="border-b border-white/10 px-5 py-4 max-md:px-4">
		<p class="text-sm leading-relaxed text-white/70">{active.question}</p>
		<p class="mt-2 font-mono text-[12.5px] text-[#86efac]">$ {active.command}</p>
	</div>

	<div
		id="tool-panel"
		role="tabpanel"
		aria-labelledby="tool-tab-{active.id}"
		class="h-[460px] overflow-auto px-5 py-5 max-md:h-[340px] max-md:px-4"
	>
		<pre
			class="font-mono text-[12.5px] leading-[1.75] whitespace-pre text-white/75">{active.output}</pre>
	</div>

	<p class="border-t border-white/10 px-5 py-4 text-[13px] leading-relaxed text-white/50 max-md:px-4">
		{active.note}
	</p>
</div>

<script lang="ts">
	// Static syntax highlighter for the OpenSchema DSL. Self-contained (no
	// tree-sitter / CodeMirror) so it renders reliably during SSR and on the
	// marketing pages. The palette mirrors the in-designer highlighter.

	type Token = { text: string; cls: string };

	let { source }: { source: string } = $props();

	const KEYWORDS = new Set(['namespace', 'model', 'enum', 'import', 'from', 'op', 'extend', 'union']);
	const BUILTINS = new Set([
		'string', 'bool', 'boolean', 'uuid', 'timestamp', 'datetime', 'date',
		'i32', 'i64', 'u32', 'u64', 'f32', 'f64', 'int', 'float', 'bytes', 'json', 'any'
	]);
	const CONSTANTS = new Set(['true', 'false', 'null']);

	// Ordered scanners. `y` (sticky) matches only at the current cursor.
	const SCANNERS: { cls: string; re: RegExp }[] = [
		{ cls: 'ws', re: /\s+/y },
		{ cls: 'tok-comment', re: /\/\/.*/y },
		{ cls: 'tok-string', re: /"(?:[^"\\]|\\.)*"/y },
		{ cls: 'tok-member', re: /`[^`]*`/y },
		{ cls: 'tok-decorator', re: /@[A-Za-z_][A-Za-z0-9_.]*/y },
		{ cls: 'tok-number', re: /\d+(?:\.\d+)?/y },
		{ cls: 'ident', re: /[A-Za-z_][A-Za-z0-9_]*/y },
		{ cls: 'tok-punct', re: /[{}()[\]:?,<>.=|&-]/y },
		{ cls: 'plain', re: /./y }
	];

	// A bare identifier's role depends on context: a known keyword/type, an
	// uppercase model name, or a field name when followed by `:`.
	function classifyIdent(word: string, rest: string): string {
		if (KEYWORDS.has(word)) return 'tok-keyword';
		if (BUILTINS.has(word)) return 'tok-type';
		if (CONSTANTS.has(word)) return 'tok-number';
		if (/^\s*:/.test(rest)) return 'tok-member';
		if (/^[A-Z]/.test(word)) return 'tok-type';
		return 'plain';
	}

	function tokenizeLine(line: string): Token[] {
		const tokens: Token[] = [];
		let cursor = 0;
		while (cursor < line.length) {
			const matched = scanOne(line, cursor);
			if (!matched) break;
			tokens.push(matched.token);
			cursor = matched.next;
		}
		return tokens;
	}

	function scanOne(line: string, cursor: number): { token: Token; next: number } | null {
		for (const scanner of SCANNERS) {
			scanner.re.lastIndex = cursor;
			const match = scanner.re.exec(line);
			if (!match) continue;
			const text = match[0];
			const next = cursor + text.length;
			const cls = scanner.cls === 'ident' ? classifyIdent(text, line.slice(next)) : scanner.cls;
			return { token: { text, cls }, next };
		}
		return null;
	}

	// DSL comments and strings never span lines, so per-line tokenizing is safe and
	// keeps the line-number gutter trivial.
	const lines = $derived(source.replace(/\n$/, '').split('\n').map(tokenizeLine));
</script>

<div class="schema-code overflow-x-auto font-mono text-[12.5px] leading-[1.7]">
	{#each lines as tokens, index}
		<div class="flex">
			<span class="select-none pr-4 pl-3 text-right text-line" style="min-width: 2.5rem;">
				{index + 1}
			</span>
			<code class="pr-4 whitespace-pre">
				{#each tokens as token}
					{#if token.cls === 'ws' || token.cls === 'plain'}{token.text}{:else}<span
							class={token.cls}>{token.text}</span
						>{/if}
				{/each}
			</code>
		</div>
	{/each}
</div>

<style>
	/* Dark palette (default) — tailwind 300-level hues on a near-black panel. */
	.schema-code {
		--tok-comment: #9ca3af;
		--tok-keyword: #c4b5fd;
		--tok-decorator: #f0abfc;
		--tok-type: #7dd3fc;
		--tok-string: #86efac;
		--tok-number: #fcd34d;
		--tok-punct: #a1a1aa;
	}

	/* Light palette — 600/700-level hues so tokens stay legible on white. */
	:global([data-theme='light']) .schema-code {
		--tok-comment: #6b7280;
		--tok-keyword: #7c3aed;
		--tok-decorator: #c026d3;
		--tok-type: #0369a1;
		--tok-string: #15803d;
		--tok-number: #b45309;
		--tok-punct: #71717a;
	}

	.schema-code :global(.tok-comment) {
		color: var(--tok-comment);
		font-style: italic;
	}
	.schema-code :global(.tok-keyword) {
		color: var(--tok-keyword);
		font-weight: 600;
	}
	.schema-code :global(.tok-decorator) {
		color: var(--tok-decorator);
	}
	.schema-code :global(.tok-type) {
		color: var(--tok-type);
	}
	.schema-code :global(.tok-string) {
		color: var(--tok-string);
	}
	.schema-code :global(.tok-number) {
		color: var(--tok-number);
	}
	.schema-code :global(.tok-member) {
		color: var(--text);
	}
	.schema-code :global(.tok-punct) {
		color: var(--tok-punct);
	}
	/* Unclassified text and default code color follow the theme. */
	.schema-code code {
		color: var(--text-muted);
	}
</style>

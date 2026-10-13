/**
 * A small syntax highlighter for the docs: enough for shell commands, JSON and TypeScript.
 * Output is escaped HTML with `token <kind>` spans, styled in neoworks.css.
 */
type Rule = { kind: string; pattern: RegExp };

const typescriptRules: Rule[] = [
	{ kind: 'comment', pattern: /\/\/[^\n]*|\/\*[\s\S]*?\*\//y },
	{ kind: 'string', pattern: /`(?:\\[\s\S]|[^`\\])*`|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/y },
	{
		kind: 'keyword',
		pattern:
			/\b(?:import|export|from|const|let|var|function|return|if|else|await|async|new|type|interface|extends|for|of|in|try|catch|throw|default|as|class|typeof|null|undefined|true|false)\b/y
	},
	{ kind: 'number', pattern: /\b\d[\d_.]*\b/y },
	{ kind: 'function', pattern: /[A-Za-z_$][\w$]*(?=\()/y }
];

const kotlinRules: Rule[] = [
	{ kind: 'comment', pattern: /\/\/[^\n]*|\/\*[\s\S]*?\*\//y },
	{ kind: 'string', pattern: /"\"\"[\s\S]*?\"\"\"|"(?:\\.|[^"\\\n])*"/y },
	{
		kind: 'keyword',
		pattern:
			/\b(?:package|import|fun|val|var|class|object|interface|data|suspend|override|private|public|internal|const|return|if|else|when|for|while|in|is|as|try|catch|throw|null|true|false|this)\b/y
	},
	{ kind: 'number', pattern: /\b\d[\d_.]*[Lf]?\b/y },
	{ kind: 'function', pattern: /[A-Za-z_][\w]*(?=\()/y }
];

const goRules: Rule[] = [
	{ kind: 'comment', pattern: /\/\/[^\n]*|\/\*[\s\S]*?\*\//y },
	{ kind: 'string', pattern: /`[^`]*`|"(?:\\.|[^"\\\n])*"/y },
	{
		kind: 'keyword',
		pattern:
			/\b(?:package|import|func|var|const|type|struct|interface|return|if|else|for|range|go|defer|switch|case|default|select|map|chan|nil|true|false)\b/y
	},
	{ kind: 'number', pattern: /\b\d[\d_.]*\b/y },
	{ kind: 'function', pattern: /[A-Za-z_][\w]*(?=\()/y }
];

const jsonRules: Rule[] = [
	{ kind: 'property', pattern: /"(?:\\.|[^"\\\n])*"(?=\s*:)/y },
	{ kind: 'string', pattern: /"(?:\\.|[^"\\\n])*"/y },
	{ kind: 'number', pattern: /-?\b\d[\d.eE+-]*\b/y },
	{ kind: 'keyword', pattern: /\b(?:true|false|null)\b/y }
];

const shellRules: Rule[] = [
	{ kind: 'comment', pattern: /#[^\n]*/y },
	{ kind: 'string', pattern: /"(?:\\.|[^"\\])*"|'[^']*'/y },
	{ kind: 'variable', pattern: /\$\{?[A-Za-z_][\w]*\}?/y },
	{ kind: 'flag', pattern: /(?<=\s)--?[A-Za-z][\w-]*/y },
	{ kind: 'function', pattern: /(?<=^|\n|\|\s*|&&\s*)[a-z][\w.-]*/y }
];

const rulesByLanguage: Record<string, Rule[]> = {
	ts: typescriptRules,
	typescript: typescriptRules,
	js: typescriptRules,
	javascript: typescriptRules,
	svelte: typescriptRules,
	kotlin: kotlinRules,
	kt: kotlinRules,
	go: goRules,
	json: jsonRules,
	bash: shellRules,
	sh: shellRules,
	shell: shellRules
};

export function escapeHtml(text: string): string {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function matchAt(rules: Rule[], code: string, index: number): { kind: string; text: string } | undefined {
	for (const rule of rules) {
		rule.pattern.lastIndex = index;
		const match = rule.pattern.exec(code);
		if (match !== null) return { kind: rule.kind, text: match[0] };
	}
	return undefined;
}

export function highlightCode(code: string, language: string): string {
	const rules = rulesByLanguage[language.toLowerCase()];
	if (rules === undefined) return escapeHtml(code);

	let html = '';
	let plain = '';
	let index = 0;
	while (index < code.length) {
		const token = matchAt(rules, code, index);
		if (token === undefined) {
			plain += code[index];
			index += 1;
			continue;
		}
		html += escapeHtml(plain) + `<span class="token ${token.kind}">${escapeHtml(token.text)}</span>`;
		plain = '';
		index += token.text.length;
	}
	return html + escapeHtml(plain);
}

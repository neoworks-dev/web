// Autocomplete for the OpenSchema editor. The base completions come from the
// language's OWN LSP — we call its pure `completion(text, position, schema)`
// directly (no server transport) and adapt the LSP CompletionItems to CodeMirror.
// On top of that we layer the neoworks-namespaced decorators (@neoworks.kind, …)
// and their argument values, which the generic OpenSchema vocabulary does not
// know but the neoworks compiler recognises.
import { autocompletion } from '@codemirror/autocomplete';
import type { CompletionContext, CompletionResult, Completion } from '@codemirror/autocomplete';
import type { Extension } from '@codemirror/state';
import { parse, resolve } from 'openschema';
import type { ResolvedSchema } from 'openschema';
import { completion as lspCompletion } from 'openschema/dist/lsp/features.js';

// LSP CompletionItemKind (numeric) → CodeMirror completion type (drives the icon).
const KIND_TO_TYPE: Record<number, string> = {
	5: 'property', // Field
	7: 'class', // Class
	8: 'interface', // Interface
	10: 'property', // Property
	13: 'enum', // Enum
	14: 'keyword', // Keyword
	20: 'enum', // EnumMember
	22: 'type', // Struct
};

// neoworks-specific table/field decorators (recognised by the internal emitter,
// absent from the generic OpenSchema vocabulary).
const NEOWORKS_DECORATORS: Completion[] = [
	{ label: 'neoworks.kind', type: 'property', detail: 'neoworks', info: '@neoworks.kind("data" | "internal" | "relation" | "helper") — row ownership model for the table.' },
	{ label: 'neoworks.visibility', type: 'property', detail: 'neoworks', info: '@neoworks.visibility("private" | "shared" | "public") — read visibility.' },
	{ label: 'neoworks.unique', type: 'property', detail: 'neoworks', info: '@neoworks.unique("a", "b") — unique index over the given columns.' },
	{ label: 'neoworks.index', type: 'property', detail: 'neoworks', info: '@neoworks.index("a", "b") — secondary index over the given columns.' },
	{ label: 'neoworks.fulltext', type: 'property', detail: 'neoworks', info: '@neoworks.fulltext — BM25 full-text index on a string field.' },
	{ label: 'neoworks.history', type: 'property', detail: 'neoworks', info: '@neoworks.history — keep an append-only version history for the table.' },
	{ label: 'neoworks.schemaless', type: 'property', detail: 'neoworks', info: '@neoworks.schemaless — SCHEMALESS table (default is SCHEMAFULL).' },
	{ label: 'neoworks.subjectPath', type: 'property', detail: 'neoworks', info: '@neoworks.subjectPath("in.subject_user_id") — relation/helper tables: how a row traces back to a user.' },
];

// Argument values for the enum-like neoworks decorators.
const KIND_VALUES: Completion[] = [
	{ label: 'data', type: 'enum', detail: 'kind', info: 'Per-user rows: each row is owned by the signed-in user (subject_user_id). Default.' },
	{ label: 'internal', type: 'enum', detail: 'kind', info: "Org-internal rows: no per-user owner. Any of the org's clients read and write every row." },
	{ label: 'relation', type: 'enum', detail: 'kind', info: 'Edge/relation table; must set @neoworks.subjectPath so rows trace to a user.' },
	{ label: 'helper', type: 'enum', detail: 'kind', info: 'Helper table; must set @neoworks.subjectPath so rows trace to a user.' },
];
const VISIBILITY_VALUES: Completion[] = [
	{ label: 'private', type: 'enum', detail: 'visibility', info: 'Owner only (default).' },
	{ label: 'shared', type: 'enum', detail: 'visibility', info: 'Owner plus explicitly granted users.' },
	{ label: 'public', type: 'enum', detail: 'visibility', info: 'Anyone, including anonymous callers.' },
];

function schemaFor(text: string): ResolvedSchema | null {
	try {
		return resolve(parse(text));
	} catch {
		return null;
	}
}

// The enum-decorator whose parentheses the cursor sits inside, or null.
function enclosingNeoworksArg(lineBefore: string): 'kind' | 'visibility' | null {
	const match = /@neoworks\.(kind|visibility)\s*\([^)]*$/.exec(lineBefore);
	if (match === null) return null;
	return match[1] as 'kind' | 'visibility';
}

// True when the cursor is on a decorator head (after `@`, not yet in its args).
function isDecoratorHead(lineBefore: string): boolean {
	if (/@[\w.]*\([^)]*$/.test(lineBefore)) return false;
	return /@[\w.]*$/.test(lineBefore);
}

// Completes a decorator argument value. Emits a quoted literal when the argument
// isn't already quoted, so `@neoworks.kind(` → `@neoworks.kind("internal")`.
function argValueResult(context: CompletionContext, lineBefore: string, values: Completion[]): CompletionResult {
	const insideQuote = /"[^"]*$/.test(lineBefore);
	const word = context.matchBefore(/[\w-]*/);
	const from = word === null ? context.pos : word.from;
	const options = values.map((value) => {
		if (insideQuote) return value;
		return { ...value, apply: `"${value.label}"` };
	});
	return { from, options };
}

function openschemaSource(context: CompletionContext): CompletionResult | null {
	const line = context.state.doc.lineAt(context.pos);
	const lineBefore = line.text.slice(0, context.pos - line.from);

	const arg = enclosingNeoworksArg(lineBefore);
	if (arg === 'kind') return argValueResult(context, lineBefore, KIND_VALUES);
	if (arg === 'visibility') return argValueResult(context, lineBefore, VISIBILITY_VALUES);

	const word = context.matchBefore(/[\w.]*/);
	if (word === null) return null;
	if (word.from === word.to && !context.explicit) return null;

	const text = context.state.doc.toString();
	const position = { line: line.number - 1, character: context.pos - line.from };
	const items = lspCompletion(text, position, schemaFor(text));

	const options: Completion[] = items.map((item) => {
		const option: Completion = { label: item.label };
		if (typeof item.kind === 'number' && KIND_TO_TYPE[item.kind]) {
			option.type = KIND_TO_TYPE[item.kind];
		}
		if (typeof item.detail === 'string') {
			option.detail = item.detail;
		}
		const doc = item.documentation;
		if (doc !== undefined && doc !== null && typeof doc !== 'string' && typeof doc.value === 'string') {
			option.info = doc.value;
		}
		return option;
	});

	// Offer the neoworks decorators alongside the LSP's generic ones.
	if (isDecoratorHead(lineBefore)) {
		options.push(...NEOWORKS_DECORATORS);
	}

	if (options.length === 0) return null;
	return { from: word.from, options };
}

export function openschemaCompletion(): Extension {
	return autocompletion({ override: [openschemaSource] });
}

// CodeMirror 6 highlighting for the OpenSchema DSL, driven by the project's own
// tree-sitter grammar (compiled to WASM) + highlights.scm — the same assets the
// read-only highlighter in apps/openschema uses. A ViewPlugin re-parses on every
// edit and maps the query captures onto CodeMirror decorations.
import { EditorView, ViewPlugin, Decoration } from '@codemirror/view';
import type { DecorationSet, ViewUpdate } from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';
import type { Extension } from '@codemirror/state';
import { Parser, Language, Query } from 'web-tree-sitter';
import runtimeWasmUrl from 'web-tree-sitter/web-tree-sitter.wasm?url';
import grammarWasmUrl from './openschema.wasm?url';
import highlightsQuery from './highlights.scm?raw';

// tree-sitter capture name → decoration class. More specific names win; the base
// segment (before the first dot) is the fallback.
const CAPTURE_CLASS: Record<string, string> = {
	comment: 'tsh-comment',
	'comment.documentation': 'tsh-comment',
	keyword: 'tsh-keyword',
	'keyword.modifier': 'tsh-keyword',
	string: 'tsh-string',
	number: 'tsh-number',
	'number.float': 'tsh-number',
	boolean: 'tsh-number',
	'type.builtin': 'tsh-type-builtin',
	'type.definition': 'tsh-type',
	'type.parameter': 'tsh-type',
	type: 'tsh-type',
	function: 'tsh-function',
	'function.call': 'tsh-function',
	module: 'tsh-module',
	'variable.member': 'tsh-member',
	'variable.parameter': 'tsh-param',
	constant: 'tsh-constant',
	attribute: 'tsh-attribute',
	operator: 'tsh-operator',
	'punctuation.delimiter': 'tsh-punct',
	'punctuation.bracket': 'tsh-punct',
};

function classForCapture(name: string): string | null {
	if (CAPTURE_CLASS[name]) return CAPTURE_CLASS[name];
	const base = name.split('.')[0];
	if (CAPTURE_CLASS[base]) return CAPTURE_CLASS[base];
	return null;
}

let languagePromise: Promise<Language> | null = null;

function loadLanguage(): Promise<Language> {
	if (!languagePromise) {
		languagePromise = (async () => {
			await Parser.init({ locateFile: () => runtimeWasmUrl });
			return Language.load(grammarWasmUrl);
		})();
	}
	return languagePromise;
}

// Assigns each character the class of the narrowest capture covering it, so nested
// captures override broader parents. Mirrors the read-only highlighter.
function classifyChars(
	captures: { name: string; startIndex: number; endIndex: number }[],
	length: number
): (string | null)[] {
	const classes: (string | null)[] = new Array(length).fill(null);
	const spans: number[] = new Array(length).fill(Infinity);
	for (const capture of captures) {
		const tokenClass = classForCapture(capture.name);
		if (!tokenClass) continue;
		const width = capture.endIndex - capture.startIndex;
		for (let i = capture.startIndex; i < capture.endIndex && i < length; i++) {
			if (width < spans[i]) {
				spans[i] = width;
				classes[i] = tokenClass;
			}
		}
	}
	return classes;
}

// tree-sitter offsets track bytes, so non-ASCII input would drift; skip
// highlighting entirely in that case (rare for schema DSL) rather than misalign.
function isHighlightable(source: string): boolean {
	return !/[^\x00-\x7F]/.test(source);
}

class OpenschemaHighlighter {
	decorations: DecorationSet = Decoration.none;
	private parser: Parser | null = null;
	private query: Query | null = null;

	constructor(view: EditorView) {
		this.load(view);
	}

	private async load(view: EditorView) {
		const language = await loadLanguage();
		const parser = new Parser();
		parser.setLanguage(language);
		this.parser = parser;
		this.query = new Query(language, highlightsQuery);
		this.decorations = this.build(view.state.doc.toString());
		// Re-render now that the grammar is ready (the initial paint was plain).
		try {
			view.dispatch({});
		} catch {
			// view may already be torn down
		}
	}

	update(update: ViewUpdate) {
		if (this.parser && this.query && update.docChanged) {
			this.decorations = this.build(update.state.doc.toString());
		}
	}

	private build(source: string): DecorationSet {
		if (!this.parser || !this.query || source.length === 0 || !isHighlightable(source)) {
			return Decoration.none;
		}
		const tree = this.parser.parse(source);
		if (!tree) return Decoration.none;

		const captures = this.query.captures(tree.rootNode).map((capture) => ({
			name: capture.name,
			startIndex: capture.node.startIndex,
			endIndex: capture.node.endIndex,
		}));
		tree.delete();

		const classes = classifyChars(captures, source.length);
		const builder = new RangeSetBuilder<Decoration>();
		let cursor = 0;
		while (cursor < source.length) {
			const current = classes[cursor];
			let end = cursor + 1;
			while (end < source.length && classes[end] === current) end++;
			if (current) {
				builder.add(cursor, end, Decoration.mark({ class: current }));
			}
			cursor = end;
		}
		return builder.finish();
	}

	destroy() {
		this.parser?.delete();
		this.parser = null;
		this.query = null;
	}
}

// High-contrast token palette (tailwind 300-level hues) that stays legible on the
// elevated editor background while keeping each capture visually distinct.
const highlightTheme = EditorView.baseTheme({
	'.tsh-comment': { color: '#9ca3af', fontStyle: 'italic' },
	'.tsh-keyword': { color: '#c4b5fd', fontWeight: '600' },
	'.tsh-module': { color: '#c4b5fd' },
	'.tsh-string': { color: '#86efac' },
	'.tsh-number, .tsh-constant': { color: '#fcd34d' },
	'.tsh-type, .tsh-type-builtin': { color: '#7dd3fc' },
	'.tsh-function, .tsh-attribute': { color: '#f0abfc' },
	'.tsh-member': { color: '#f4f4f5' },
	'.tsh-param': { color: '#fca5a5' },
	'.tsh-operator': { color: '#93c5fd' },
	'.tsh-punct': { color: '#a1a1aa' },
});

export function openschemaHighlighting(): Extension {
	return [
		ViewPlugin.fromClass(OpenschemaHighlighter, {
			decorations: (plugin) => plugin.decorations,
		}),
		highlightTheme,
	];
}

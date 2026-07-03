<script lang="ts">
	import { onMount } from 'svelte';
	import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view';
	import type { KeyBinding } from '@codemirror/view';
	import { EditorState, Compartment } from '@codemirror/state';
	import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
	import { completionKeymap } from '@codemirror/autocomplete';
	import { openschemaHighlighting } from '$lib/treesitter/openschemaHighlight';
	import { openschemaCompletion } from './openschemaCompletion';

	let {
		value = $bindable(''),
		placeholder = '',
	}: {
		value?: string;
		placeholder?: string;
	} = $props();

	let host: HTMLDivElement;
	let view: EditorView | null = null;

	// Editor-local zoom: Ctrl/Cmd +/- adjusts only the font size (not the page).
	const DEFAULT_FONT_SIZE = 12.5;
	const MIN_FONT_SIZE = 8;
	const MAX_FONT_SIZE = 32;
	let fontSize = DEFAULT_FONT_SIZE;
	const fontSizeCompartment = new Compartment();

	function fontSizeTheme(px: number) {
		return EditorView.theme({ '&': { fontSize: px + 'px' } });
	}

	function setFontSize(px: number, target: EditorView) {
		fontSize = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, px));
		target.dispatch({ effects: fontSizeCompartment.reconfigure(fontSizeTheme(fontSize)) });
	}

	// Bound to both the `=`/`+` and `-` keys (with and without shift) so Ctrl+= and
	// Ctrl+- work regardless of layout; Ctrl+0 resets.
	const zoomKeymap: KeyBinding[] = [
		{ key: 'Mod-=', run: (v) => { setFontSize(fontSize + 1, v); return true; } },
		{ key: 'Mod-+', run: (v) => { setFontSize(fontSize + 1, v); return true; } },
		{ key: 'Mod--', run: (v) => { setFontSize(fontSize - 1, v); return true; } },
		{ key: 'Mod-0', run: (v) => { setFontSize(DEFAULT_FONT_SIZE, v); return true; } },
	];

	// Theme keeps the editor flush with the surrounding panel: transparent bg (the
	// container paints it), design-token text, comfortable mono type.
	const theme = EditorView.theme(
		{
			'&': { height: '100%', backgroundColor: 'transparent', color: 'var(--text)' },
			'.cm-scroller': { fontFamily: 'var(--font-mono, ui-monospace, monospace)', lineHeight: '1.6' },
			'.cm-content': { padding: '8px 0' },
			'.cm-gutters': { backgroundColor: 'transparent', border: 'none', color: 'var(--text-faint)' },
			'.cm-activeLine': { backgroundColor: 'color-mix(in srgb, var(--text) 4%, transparent)' },
			'.cm-activeLineGutter': { backgroundColor: 'transparent' },
			'.cm-cursor': { borderLeftColor: 'var(--color-accent)' },
		},
		{ dark: true }
	);

	onMount(() => {
		view = new EditorView({
			parent: host,
			state: EditorState.create({
				doc: value,
				extensions: [
					lineNumbers(),
					highlightActiveLine(),
					history(),
					keymap.of([...zoomKeymap, ...completionKeymap, ...defaultKeymap, ...historyKeymap, indentWithTab]),
					openschemaHighlighting(),
					openschemaCompletion(),
					theme,
					fontSizeCompartment.of(fontSizeTheme(fontSize)),
					EditorView.lineWrapping,
					EditorState.tabSize.of(2),
					EditorView.updateListener.of((update) => {
						if (update.docChanged) value = update.state.doc.toString();
					}),
				],
			}),
		});
		return () => view?.destroy();
	});

	// Reflect external value changes (e.g. programmatic resets) back into the editor
	// without clobbering the user's cursor while they type.
	$effect(() => {
		const next = value;
		if (view && next !== view.state.doc.toString()) {
			view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: next } });
		}
	});
</script>

<div bind:this={host} class="h-full w-full overflow-hidden" data-placeholder={placeholder}></div>

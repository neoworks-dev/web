import { untrack } from 'svelte';
import type { Component } from 'svelte';

export interface ShortcutKeys {
	key: string;     // e.g. 'k', 'z', 'Enter'
	ctrl?: boolean;  // primary modifier — Ctrl on Windows, Cmd on Mac
	shift?: boolean;
	alt?: boolean;
}

export interface Command {
	id: string;
	label: string;
	description?: string;
	icon?: Component;
	shortcut?: string;     // display override; auto-generated from keys if omitted
	keys?: ShortcutKeys;   // default keyboard binding
	group?: string;
	disabled?: () => boolean;
	action: () => void;
}

const STORAGE_KEY = 'neoworks:cmd-shortcuts';

function loadCustom(): Record<string, ShortcutKeys> {
	try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'); }
	catch { return {}; }
}

let _open    = $state(false);
let _cmds    = $state<Command[]>([]);
let _custom  = $state<Record<string, ShortcutKeys>>(
	typeof localStorage !== 'undefined' ? loadCustom() : {}
);

export const palette = {
	get open()            { return _open; },
	get commands()        { return _cmds; },
	get customShortcuts() { return _custom; },
	show()   { _open = true; },
	hide()   { _open = false; },
	toggle() { _open = !_open; },

	setCustomShortcut(id: string, keys: ShortcutKeys | null) {
		const current = untrack(() => _custom);
		if (keys === null) {
			const { [id]: _, ...rest } = current;
			_custom = rest;
		} else {
			_custom = { ...current, [id]: keys };
		}
		localStorage.setItem(STORAGE_KEY, JSON.stringify(_custom));
	},

	register(cmds: Command[]): () => void {
		_cmds = [...untrack(() => _cmds), ...cmds];
		const ids = new Set(cmds.map(c => c.id));
		return () => { _cmds = untrack(() => _cmds).filter(c => !ids.has(c.id)); };
	},
};

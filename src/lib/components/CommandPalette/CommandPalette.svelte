<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import MagnifyingGlassIcon from 'phosphor-svelte/lib/MagnifyingGlassIcon';
	import KeyboardIcon from 'phosphor-svelte/lib/KeyboardIcon';
	import XIcon from 'phosphor-svelte/lib/XIcon';
	import { palette, type Command, type ShortcutKeys } from './commandPalette.svelte.js';

	let query       = $state('');
	let selectedIdx = $state(0);
	let recordingId = $state<string | null>(null);
	let inputEl     = $state<HTMLInputElement | null>(null);
	let listEl      = $state<HTMLElement | null>(null);

	const filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		return palette.commands.filter(c =>
			!q ||
			c.label.toLowerCase().includes(q) ||
			c.description?.toLowerCase().includes(q) ||
			c.group?.toLowerCase().includes(q)
		);
	});

	const groups = $derived.by(() => {
		const map = new Map<string, Command[]>();
		for (const cmd of filtered) {
			const g = cmd.group ?? '';
			if (!map.has(g)) map.set(g, []);
			map.get(g)!.push(cmd);
		}
		return map;
	});

	$effect(() => {
		filtered;
		const first = filtered.findIndex(c => !c.disabled?.());
		selectedIdx = first === -1 ? 0 : first;
		recordingId = null;
	});

	$effect(() => {
		if (palette.open) {
			query = '';
			recordingId = null;
			setTimeout(() => inputEl?.focus(), 0);
		}
	});

	$effect(() => {
		if (!listEl) return;
		listEl.querySelector<HTMLElement>('[data-selected="true"]')?.scrollIntoView({ block: 'nearest' });
	});

	function shortcutLabel(keys: ShortcutKeys): string {
		const parts: string[] = [];
		if (keys.ctrl)  parts.push('Ctrl');
		if (keys.shift) parts.push('Shift');
		if (keys.alt)   parts.push('Alt');
		parts.push(keys.key.length === 1 ? keys.key.toUpperCase() : keys.key);
		return parts.join('+');
	}

	function matchesShortcut(e: KeyboardEvent, keys: ShortcutKeys): boolean {
		return (
			e.key.toLowerCase() === keys.key.toLowerCase() &&
			!!(e.ctrlKey || e.metaKey) === !!keys.ctrl &&
			!!e.shiftKey === !!keys.shift &&
			!!e.altKey   === !!keys.alt
		);
	}

	function effectiveShortcut(cmd: Command): ShortcutKeys | null {
		return palette.customShortcuts[cmd.id] ?? cmd.keys ?? null;
	}

	function badgeLabel(cmd: Command): string | null {
		const custom = palette.customShortcuts[cmd.id];
		if (custom) return shortcutLabel(custom);
		return cmd.shortcut ?? (cmd.keys ? shortcutLabel(cmd.keys) : null);
	}

	function run(cmd: Command) {
		if (cmd.disabled?.()) return;
		palette.hide();
		cmd.action();
	}

	function startRecording(id: string, e: MouseEvent) {
		e.stopPropagation();
		recordingId = id;
	}

	function clearCustomShortcut(id: string, e: MouseEvent) {
		e.stopPropagation();
		palette.setCustomShortcut(id, null);
	}

	const MODIFIERS = new Set(['Control', 'Shift', 'Alt', 'Meta']);

	onMount(() => {
		const onKey = (e: KeyboardEvent) => {
			// recording mode — capture next non-modifier keypress
			if (recordingId) {
				e.preventDefault();
				e.stopPropagation();
				if (e.key === 'Escape') { recordingId = null; return; }
				if (MODIFIERS.has(e.key)) return;
				palette.setCustomShortcut(recordingId, {
					key:   e.key,
					ctrl:  e.ctrlKey || e.metaKey,
					shift: e.shiftKey,
					alt:   e.altKey,
				});
				recordingId = null;
				return;
			}

			if ((e.ctrlKey || e.metaKey) && e.key === 'p') { e.preventDefault(); palette.toggle(); return; }

			// global command shortcuts — fire when palette is closed
			if (!palette.open) {
				for (const cmd of palette.commands) {
					const keys = effectiveShortcut(cmd);
					if (!keys || cmd.disabled?.()) continue;
					if (matchesShortcut(e, keys)) { e.preventDefault(); cmd.action(); return; }
				}
				return;
			}

			if (e.key === 'Escape')    { e.preventDefault(); palette.hide(); }
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				let i = selectedIdx + 1;
				while (i < filtered.length && filtered[i].disabled?.()) i++;
				if (i < filtered.length) selectedIdx = i;
			}
			if (e.key === 'ArrowUp') {
				e.preventDefault();
				let i = selectedIdx - 1;
				while (i >= 0 && filtered[i].disabled?.()) i--;
				if (i >= 0) selectedIdx = i;
			}
			if (e.key === 'Enter' && filtered[selectedIdx]) { e.preventDefault(); run(filtered[selectedIdx]); }
		};
		window.addEventListener('keydown', onKey, { capture: true });
		return () => window.removeEventListener('keydown', onKey, { capture: true });
	});
</script>

{#if palette.open}
	<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
	<div
		class="fixed inset-0 z-[800] flex items-start justify-center pt-[15vh]"
		style="background: var(--overlay-scrim)"
		onclick={() => { if (recordingId) { recordingId = null; } else { palette.hide(); } }}
	>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="w-full max-w-[480px] mx-4 rounded-xl border border-line bg-elevated overflow-hidden shadow-lg"
			onclick={(e) => e.stopPropagation()}
			in:fly={{ y: -6, duration: 140 }}
		>
			<!-- search -->
			<div class="flex items-center gap-3 px-4 h-11 border-b border-line">
				<MagnifyingGlassIcon size={14} class="text-dim shrink-0" />
				<input
					bind:this={inputEl}
					bind:value={query}
					placeholder={recordingId ? 'Press a key combination…' : 'Type a command…'}
					disabled={!!recordingId}
					class="flex-1 h-full bg-transparent border-0 outline-none focus:ring-0 focus:shadow-none text-default text-sm placeholder:text-dim disabled:opacity-50"
					style="font-family: var(--font-sans);"
				/>
				<kbd class="shrink-0 font-mono text-[10px] text-dim border border-line rounded px-1.5 py-0.5">esc</kbd>
			</div>

			<!-- results -->
			<div bind:this={listEl} class="max-h-72 overflow-y-auto py-1.5">
				{#if filtered.length === 0}
					<p class="px-4 py-6 text-center text-sm text-dim">No results</p>
				{:else}
					{#each [...groups.entries()] as [group, cmds]}
						{#if group}
							<div class="px-3 pt-2.5 pb-1 text-[10px] font-semibold text-dim uppercase tracking-widest select-none">
								{group}
							</div>
						{/if}
						{#each cmds as cmd}
							{@const idx    = filtered.indexOf(cmd)}
							{@const disabled = cmd.disabled?.() ?? false}
							{@const active = idx === selectedIdx}
							{@const recording = recordingId === cmd.id}
							{@const badge  = badgeLabel(cmd)}
							{@const hasCustom = !!palette.customShortcuts[cmd.id]}
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								data-selected={active}
								class="flex items-center gap-2.5 h-9 px-3 mx-1.5 rounded-lg select-none group"
								class:bg-hover={active && !disabled}
								class:opacity-35={disabled}
								class:cursor-pointer={!disabled && !recording}
								class:cursor-not-allowed={disabled}
								class:ring-1={recording}
								class:ring-violet={recording}
								onmouseenter={() => { if (!disabled) selectedIdx = idx; }}
								onclick={() => { if (!recording) run(cmd); }}
							>
								{#if cmd.icon}
									{@const Icon = cmd.icon}
									<Icon size={14} class="text-dim shrink-0" />
								{/if}

								<span class="flex-1 text-[13px] text-default truncate">{cmd.label}</span>

								{#if cmd.description}
									<span class="text-[11px] text-dim truncate max-w-[140px] shrink-0">{cmd.description}</span>
								{/if}

								{#if recording}
									<span class="text-[11px] text-violet shrink-0 animate-pulse">recording…</span>
								{:else}
									{#if badge}
										<kbd class="shrink-0 font-mono text-[10px] border rounded px-1.5 py-0.5
											{hasCustom ? 'text-violet border-violet/40' : 'text-dim border-line'}"
										>{badge}</kbd>
									{/if}

									{#if active && !disabled}
										<div class="flex items-center gap-1 shrink-0 ml-0.5">
											<!-- svelte-ignore a11y_consider_explicit_label -->
											<button
												class="p-0.5 rounded text-dim hover:text-default transition-colors"
												title={hasCustom ? 'Change shortcut' : 'Set shortcut'}
												onclick={(e) => startRecording(cmd.id, e)}
											>
												<KeyboardIcon size={12} />
											</button>
											{#if hasCustom}
												<!-- svelte-ignore a11y_consider_explicit_label -->
												<button
													class="p-0.5 rounded text-dim hover:text-red transition-colors"
													title="Remove custom shortcut"
													onclick={(e) => clearCustomShortcut(cmd.id, e)}
												>
													<XIcon size={12} />
												</button>
											{/if}
										</div>
									{/if}
								{/if}
							</div>
						{/each}
					{/each}
				{/if}
			</div>
		</div>
	</div>
{/if}

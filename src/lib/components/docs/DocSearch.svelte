<script lang="ts">
	import { goto } from '$app/navigation';
	import { fly, fade } from 'svelte/transition';
	import MagnifyingGlassIcon from 'phosphor-svelte/lib/MagnifyingGlassIcon';
	import FileTextIcon from 'phosphor-svelte/lib/FileTextIcon';
	import HashIcon from 'phosphor-svelte/lib/HashIcon';

	type DocResult = {
		title: string;
		page: string;
		href: string;
		description?: string;
		isHeading: boolean;
	};

	let open = $state(false);
	let query = $state('');
	let results = $state<DocResult[]>([]);
	let activeIndex = $state(0);
	let loading = $state(false);
	let inputEl = $state<HTMLInputElement | undefined>();

	let requestId = 0;
	let debounce: ReturnType<typeof setTimeout> | undefined;

	function openSearch() {
		open = true;
		query = '';
		results = [];
		activeIndex = 0;
	}

	function closeSearch() {
		open = false;
		clearTimeout(debounce);
	}

	async function runSearch(value: string) {
		const trimmed = value.trim();
		if (!trimmed) {
			results = [];
			loading = false;
			return;
		}

		const id = ++requestId;
		loading = true;
		try {
			const response = await fetch(`/docs/search?q=${encodeURIComponent(trimmed)}`);
			const data = await response.json();
			// Ignore stale responses that resolve out of order.
			if (id !== requestId) return;
			results = data.results ?? [];
			activeIndex = 0;
		} finally {
			if (id === requestId) loading = false;
		}
	}

	function onInput(value: string) {
		query = value;
		clearTimeout(debounce);
		debounce = setTimeout(() => runSearch(value), 120);
	}

	function select(result: DocResult) {
		closeSearch();
		goto(result.href);
	}

	function onKeydown(event: KeyboardEvent) {
		// Global open shortcut.
		if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
			event.preventDefault();
			open ? closeSearch() : openSearch();
			return;
		}
		if (!open) return;

		if (event.key === 'Escape') {
			event.preventDefault();
			closeSearch();
		} else if (event.key === 'ArrowDown') {
			event.preventDefault();
			if (results.length) activeIndex = (activeIndex + 1) % results.length;
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			if (results.length) activeIndex = (activeIndex - 1 + results.length) % results.length;
		} else if (event.key === 'Enter') {
			event.preventDefault();
			const result = results[activeIndex];
			if (result) select(result);
		}
	}

	// Focus the input once the modal mounts.
	$effect(() => {
		if (open && inputEl) inputEl.focus();
	});
</script>

<svelte:window onkeydown={onKeydown} />

<!-- Trigger -->
<button
	type="button"
	onclick={openSearch}
	class="flex w-full items-center gap-2 rounded-lg border border-line bg-raised px-2.5 py-2 text-sm text-dim transition-colors hover:border-line-strong hover:text-muted"
>
	<MagnifyingGlassIcon size={16} />
	<span class="flex-1 text-left">Search docs</span>
	<kbd
		class="rounded border border-line-faint px-1.5 py-0.5 font-mono text-[10px] text-faint"
	>
		⌘K
	</kbd>
</button>

{#if open}
	<!-- Overlay -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-modal flex items-start justify-center px-4 pt-[12vh]"
		transition:fade={{ duration: 120 }}
		onclick={closeSearch}
	>
		<div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

		<!-- Palette -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			role="dialog"
			tabindex="-1"
			aria-modal="true"
			aria-label="Search documentation"
			transition:fly={{ y: -8, duration: 160 }}
			class="relative w-full max-w-[560px] overflow-hidden rounded-2xl border border-line bg-elevated shadow-[var(--shadow-overlay)]"
			onclick={(event) => event.stopPropagation()}
		>
			<!-- Input -->
			<div class="flex items-center gap-3 border-b border-line-faint px-4">
				<MagnifyingGlassIcon size={18} class="shrink-0 text-dim" />
				<input
					bind:this={inputEl}
					value={query}
					oninput={(event) => onInput(event.currentTarget.value)}
					placeholder="Search documentation…"
					class="h-12 flex-1 bg-transparent text-sm text-default placeholder:text-dim focus:outline-none"
				/>
				{#if loading}
					<span class="font-mono text-[10px] uppercase tracking-widest text-faint">…</span>
				{/if}
			</div>

			<!-- Results -->
			{#if query.trim() && results.length === 0 && !loading}
				<div class="px-4 py-8 text-center text-sm text-dim">
					No results for “{query.trim()}”
				</div>
			{:else if results.length}
				<ul class="max-h-[60vh] overflow-y-auto p-2">
					{#each results as result, index}
						<li>
							<button
								type="button"
								onclick={() => select(result)}
								onmouseenter={() => (activeIndex = index)}
								class="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors {index ===
								activeIndex
									? 'bg-hover'
									: ''}"
							>
								<span
									class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-line-faint text-dim"
								>
									{#if result.isHeading}
										<HashIcon size={15} />
									{:else}
										<FileTextIcon size={15} />
									{/if}
								</span>
								<span class="min-w-0 flex-1">
									<span class="block truncate text-sm font-medium text-default">
										{result.title}
									</span>
									<span class="block truncate text-xs text-dim">
										{result.isHeading ? result.page : (result.description ?? result.href)}
									</span>
								</span>
							</button>
						</li>
					{/each}
				</ul>
			{:else}
				<div class="px-4 py-8 text-center text-sm text-dim">
					Type to search the documentation.
				</div>
			{/if}
		</div>
	</div>
{/if}

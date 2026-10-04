<script lang="ts">
	import type { Component, ComponentProps, Snippet } from 'svelte';
	import DotsSixVerticalIcon from 'phosphor-svelte/lib/DotsSixVerticalIcon';
	import LockSimpleIcon from 'phosphor-svelte/lib/LockSimpleIcon';
	import LockSimpleOpenIcon from 'phosphor-svelte/lib/LockSimpleOpenIcon';
	import TrashIcon from 'phosphor-svelte/lib/TrashIcon';
	import FrameCornersIcon from 'phosphor-svelte/lib/FrameCornersIcon';
	import ArrowsOutIcon from 'phosphor-svelte/lib/ArrowsOutIcon';
	import ArrowsInIcon from 'phosphor-svelte/lib/ArrowsInIcon';
	import LockKeyIcon from 'phosphor-svelte/lib/LockKeyIcon';
	import LockKeyOpenIcon from 'phosphor-svelte/lib/LockKeyOpenIcon';
	import { tick } from 'svelte';
	import { menuReveal, menuHide } from '$lib/transitions';


	type IconComponentProps = ComponentProps<typeof DotsSixVerticalIcon>;

	let {
		title = '',
		subtitle = '',
		icon,
		children,
		locked = false,
		isFullscreen = false,
		suggestedSize = null,
		globalLocked = false,
		ondraghandlepointerdown,
		onresizehandlepointerdown,
		ontogglelock,
		onremove,
		onresizetosuggested,
		onfullscreen,
		ontogglglobalelock,
	}: {
		title?: string;
		subtitle?: string;
		icon?: Component<IconComponentProps>;
		children: Snippet;
		locked?: boolean;
		isFullscreen?: boolean;
		suggestedSize?: { w: number; h: number } | null;
		globalLocked?: boolean;
		ondraghandlepointerdown?: (e: PointerEvent) => void;
		onresizehandlepointerdown?: (e: PointerEvent) => void;
		ontogglelock?: () => void;
		onremove?: () => void;
		onresizetosuggested?: () => void;
		onfullscreen?: () => void;
		ontogglglobalelock?: () => void;
	} = $props();

	let menuOpen = $state(false);
	let menuX = $state(0);
	let menuY = $state(0);

	const frozen = $derived(locked || globalLocked || isFullscreen);

	function openMenu(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		menuX = e.clientX;
		menuY = e.clientY;
		menuOpen = true;
	}

	function closeMenu() {
		menuOpen = false;
	}
</script>

<div class="relative flex flex-col w-full h-full rounded-xl border border-line-faint bg-elevated overflow-hidden">
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="px-3 py-2.5 flex items-start gap-2 border-b border-line-faint select-none shrink-0"
		class:cursor-grab={!frozen}
		class:cursor-default={frozen}
		onpointerdown={frozen ? undefined : ondraghandlepointerdown}
		oncontextmenu={openMenu}
	>
		{#if frozen && !globalLocked}
			<LockSimpleIcon size={14} class="text-dim shrink-0 mt-0.5" />
		{:else}
			<DotsSixVerticalIcon size={14} class="text-dim shrink-0 mt-0.5" />
		{/if}
		<div class="min-w-0">
			<div class="flex items-center gap-1.5">
				{#if icon}
					{@const Icon = icon}
					<Icon size={13} class="text-dim shrink-0" />
				{/if}
				<span class="text-[13px] font-medium text-default truncate">{title}</span>
			</div>
			{#if subtitle}
				<p class="text-[11px] text-dim truncate">{subtitle}</p>
			{/if}
		</div>
	</div>

	<div class="flex-1 overflow-auto">
		{@render children()}
	</div>

	{#if !frozen}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize"
			onpointerdown={onresizehandlepointerdown}
		>
			<svg viewBox="0 0 10 10" fill="none" class="w-full h-full text-dim opacity-50 p-1">
				<line x1="3" y1="9" x2="9" y2="3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
				<line x1="6.5" y1="9" x2="9" y2="6.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
			</svg>
		</div>
	{/if}
</div>

{#if menuOpen}
	<!-- backdrop — stopPropagation prevents click-through to fullscreen overlay -->
	<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
	<div
		class="fixed inset-0 z-[1000]"
		onclick={(e) => { e.stopPropagation(); closeMenu(); }}
	></div>

	<!-- menu -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed z-[1001] min-w-[180px] rounded-lg border border-line bg-elevated shadow-lg py-1"
		style="left: {menuX}px; top: {menuY}px"
		onclick={(e) => e.stopPropagation()}
		in:menuReveal
	>
		{#if isFullscreen}
			<button
				class="w-full h-9 px-3 flex items-center gap-2.5 text-[13px] text-default hover:bg-hover cursor-pointer"
				onclick={() => { onfullscreen?.(); closeMenu(); }}
			>
				<ArrowsInIcon size={14} class="text-dim shrink-0" />
				Exit fullscreen
			</button>
		{:else}
			<button
				class="w-full h-9 px-3 flex items-center gap-2.5 text-[13px] text-default hover:bg-hover cursor-pointer"
				onclick={() => { ontogglelock?.(); closeMenu(); }}
			>
				{#if locked}
					<LockSimpleOpenIcon size={14} class="text-dim shrink-0" />
					Unlock widget
				{:else}
					<LockSimpleIcon size={14} class="text-dim shrink-0" />
					Lock in place
				{/if}
			</button>

			<div class="h-px bg-line mx-2 my-1"></div>

			{#if suggestedSize}
				<button
					class="w-full h-9 px-3 flex items-center gap-2.5 text-[13px] text-default hover:bg-hover cursor-pointer"
					onclick={() => { onresizetosuggested?.(); closeMenu(); }}
				>
					<FrameCornersIcon size={14} class="text-dim shrink-0" />
					Resize to suggested
				</button>
			{/if}

			<button
				class="w-full h-9 px-3 flex items-center gap-2.5 text-[13px] text-default hover:bg-hover cursor-pointer"
				onclick={() => { onfullscreen?.(); closeMenu(); }}
			>
				<ArrowsOutIcon size={14} class="text-dim shrink-0" />
				Fullscreen
			</button>
		{/if}

		<div class="h-px bg-line mx-2 my-1"></div>

		<button
			class="w-full h-9 px-3 flex items-center gap-2.5 text-[13px] text-red hover:bg-hover cursor-pointer"
			onclick={async () => { closeMenu(); await tick(); onremove?.(); }}
		>
			<TrashIcon size={14} class="shrink-0" />
			Remove widget
		</button>

		<div class="h-px bg-line mx-2 my-1"></div>

		<button
			class="w-full h-9 px-3 flex items-center gap-2.5 text-[13px] text-default hover:bg-hover cursor-pointer"
			onclick={() => { ontogglglobalelock?.(); closeMenu(); }}
		>
			{#if globalLocked}
				<LockKeyOpenIcon size={14} class="text-dim shrink-0" />
				Unfreeze layout
			{:else}
				<LockKeyIcon size={14} class="text-dim shrink-0" />
				Freeze layout
			{/if}
		</button>
	</div>
{/if}

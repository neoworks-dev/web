<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';
	import { fly } from 'svelte/transition';
	import CaretDownIcon from 'phosphor-svelte/lib/CaretDownIcon';
	import ListIcon from 'phosphor-svelte/lib/ListIcon';
	import XIcon from 'phosphor-svelte/lib/XIcon';
	import NavProjectList from './NavProjectList.svelte';
	import NavMegaPanel from './NavMegaPanel.svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import ProfileMenu from './ProfileMenu.svelte';
	import { paperSwing } from '$lib/transitions';
	import { isAlwaysLight } from '$lib/theme';
	import DocsHeader from './docs/DocsHeader.svelte';
	import LatentSubnav from './latent/LatentSubnav.svelte';
	import VitalsSubnav from './vitals/VitalsSubnav.svelte';
	import {
		everydayApps,
		everydayAppsFeature,
		developerTools,
		developerToolsFeature,
		type NavFeature,
		type NavProject
	} from '$lib/data/projects';

	// On docs pages the header grows a second row of product tabs, TensorFlow-style.
	const isDocs = $derived($page.url.pathname.startsWith('/docs'));

	// The Latent site reuses this header with its own second row. Matched on the
	// route rather than the path, because on latent.<base-domain> the URL is `/`.
	const isLatent = $derived(Boolean($page.route.id?.startsWith('/latent')));

	// Same arrangement for the Vitals site on vitals.<base-domain>.
	const isVitals = $derived(Boolean($page.route.id?.startsWith('/dev/vitals')));

	// Always-light pages ignore the theme, so the toggle would do nothing there.
	const showsThemeToggle = $derived(!isAlwaysLight($page.url.pathname));

	interface User {
		email?: string;
		name?: string;
		picture?: string;
	}

	let { user = null }: { user?: User | null } = $props();

	const navLinks = [
		{ label: 'Security', href: '/#security' },
		{ label: 'Pricing', href: '/pricing' }
	];

	type MenuName = 'apps' | 'developers';

	let openMenu = $state<MenuName | null>(null);
	let mobileOpen = $state(false);

	function openMenuFor(menuName: MenuName) {
		openMenu = menuName;
	}
	function closeMenus() {
		openMenu = null;
	}
	function toggleMenu(menuName: MenuName) {
		if (openMenu === menuName) {
			closeMenus();
			return;
		}
		openMenuFor(menuName);
	}
	function closeAll() {
		closeMenus();
		mobileOpen = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') closeAll();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#snippet mobileGroup(label: string, projects: NavProject[])}
	<div class="mt-4 border-t border-line-faint pt-3">
		<h3
			class="mb-2 ml-1 text-2xs font-medium uppercase tracking-[0.12em] text-faint [font-family:var(--font-mono)]"
		>
			{label}
		</h3>
		<NavProjectList {projects} onNavigate={closeAll} />
	</div>
{/snippet}

{#snippet navMenu(menuName: MenuName, label: string, projects: NavProject[], feature: NavFeature)}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="relative" onmouseenter={() => openMenuFor(menuName)} onmouseleave={closeMenus}>
		<button
			type="button"
			aria-expanded={openMenu === menuName}
			aria-haspopup="true"
			onclick={() => toggleMenu(menuName)}
			class="flex items-center gap-1 px-3 py-2 text-base font-medium text-muted underline decoration-transparent decoration-wavy decoration-[1.5px] underline-offset-[6px] transition-[color,text-decoration-color] duration-200 hover:text-default hover:decoration-brand"
			class:text-default={openMenu === menuName}
			class:decoration-brand={openMenu === menuName}
		>
			{label}
			<CaretDownIcon
				size={12}
				weight="bold"
				class={['transition-transform duration-200', openMenu === menuName && 'rotate-180']}
			/>
		</button>
		{#if openMenu === menuName}
			<!-- Top padding bridges the gap to the button so hover is not lost on the way down. -->
			<div class="absolute left-0 top-full pt-3">
				<div
					role="menu"
					transition:paperSwing
					class="relative -rotate-[0.6deg] rounded-[4px] bg-surface p-2 shadow-[0_10px_30px_rgba(0,0,0,0.14)]"
				>
					<span
						aria-hidden="true"
						class="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-2 animate-tape-on bg-white/55 shadow-sm [animation-delay:120ms] motion-reduce:animate-none"
					></span>
					<NavMegaPanel {projects} {feature} onNavigate={closeAll} />
				</div>
			</div>
		{/if}
	</div>
{/snippet}

<header class="pointer-events-none fixed inset-x-0 top-2 z-nav flex justify-center">
		<div class="pointer-events-none flex flex-col items-center px-6 max-md:px-0 w-[min(1320px,calc(100vw-2rem))] ">
		<!-- Header card: a taped-down paper strip, plus an attached sub-nav row on docs pages. -->
		<div
			class="pointer-events-auto relative w-full -rotate-[0.4deg] animate-settle-down rounded-[4px] bg-surface shadow-[0_6px_20px_rgba(0,0,0,0.10)] motion-reduce:animate-none"
		>
			<span
				aria-hidden="true"
				class="absolute -top-2.5 -left-3 z-10 h-6 w-16 -rotate-[24deg] animate-tape-on bg-white/55 shadow-sm [animation-delay:550ms] motion-reduce:animate-none"
			></span>
			<span
				aria-hidden="true"
				class="absolute -top-2.5 -right-3 z-10 h-6 w-16 rotate-[24deg] animate-tape-on bg-white/55 shadow-sm [animation-delay:700ms] motion-reduce:animate-none"
			></span>
		<nav class="flex h-[52px] items-center gap-1 px-4">
			<!-- Wordmark -->
			<a href="/" class="mr-1 flex shrink-0 items-center gap-2.5 text-default" onclick={closeAll}>
				<svg width="22" height="22" viewBox="0 0 100 100" fill="none" aria-hidden="true">
					<circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="7" />
					<path
						d="M 81 27 C 73 51, 55 69, 26 74"
						stroke="currentColor"
						stroke-width="7"
						stroke-linecap="round"
					/>
				</svg>
				<span class="text-md font-semibold tracking-tight text-default">NeoWorks</span>
			</a>

			<!-- Center nav (desktop) -->
			<div class="hidden items-center gap-0.5 md:flex">
				{@render navMenu('apps', 'Apps', everydayApps, everydayAppsFeature)}
				{@render navMenu('developers', 'Developers', developerTools, developerToolsFeature)}
				{#each navLinks as link}
					<a
						href={link.href}
						class="px-3 py-2 text-base font-medium text-muted underline decoration-transparent decoration-wavy decoration-[1.5px] underline-offset-[6px] transition-[color,text-decoration-color] duration-200 hover:text-default hover:decoration-brand"
					>
						{link.label}
					</a>
				{/each}
			</div>

			<!-- Actions (desktop) -->
			<div class="ml-auto hidden items-center gap-1.5 md:flex">
				{#if showsThemeToggle}
					<ThemeToggle class="h-9 w-9" />
				{/if}
				{#if user}
					<ProfileMenu {user} />
				{:else}
					<a
						href={resolve('/auth/login')}
						class="px-3 py-2 text-base font-medium text-muted underline decoration-transparent decoration-wavy decoration-[1.5px] underline-offset-[6px] transition-[color,text-decoration-color] duration-200 hover:text-default hover:decoration-brand"
					>
						Sign in
					</a>
					<a
						href={resolve('/auth/signup')}
						class="rotate-2 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brand-fg shadow-[0_3px_8px_rgba(0,0,0,0.18)] transition-[rotate,scale,background-color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 hover:rotate-0 hover:bg-brand-hover active:scale-[0.98]"
					>
						Get started
					</a>
				{/if}
			</div>

			<!-- Mobile actions -->
			{#if showsThemeToggle}
				<ThemeToggle class="ml-auto md:hidden" />
			{/if}
			<button
				type="button"
				aria-label="Toggle menu"
				aria-expanded={mobileOpen}
				onclick={() => (mobileOpen = !mobileOpen)}
				class="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-hover hover:text-default md:hidden"
			>
				{#if mobileOpen}
					<XIcon size={20} weight="bold" />
				{:else}
					<ListIcon size={20} weight="bold" />
				{/if}
			</button>
			</nav>

			<!-- Attached sub-nav (desktop) -->
			{#if isDocs}
				<div class="hidden border-t border-line-faint md:block">
					<DocsHeader />
				</div>
			{:else if isLatent}
				<div class="hidden border-t border-line-faint md:block">
					<LatentSubnav />
				</div>
			{:else if isVitals}
				<div class="hidden border-t border-line-faint md:block">
					<VitalsSubnav />
				</div>
			{/if}
		</div>

		<!-- Mobile menu -->
		{#if mobileOpen}
			<div
				transition:fly={{ y: -6, duration: 180 }}
				class="pointer-events-auto mt-3 max-h-[70vh] w-[min(92vw,420px)] overflow-y-auto rounded-[4px] bg-surface p-4 shadow-[0_10px_30px_rgba(0,0,0,0.14)] md:hidden"
			>
				<div class="flex flex-col gap-1">
					{#each navLinks as link}
						<a
							href={link.href}
							onclick={closeAll}
							class="rounded-lg px-3 py-2.5 text-base font-medium text-muted transition-colors hover:bg-hover hover:text-default"
						>
							{link.label}
						</a>
					{/each}
				</div>

				{@render mobileGroup('Apps', everydayApps)}
				{@render mobileGroup('Developers', developerTools)}

				<div class="mt-4 flex flex-col gap-2 border-t border-line-faint pt-4">
					{#if user}
						<a
							href="/dashboard"
							onclick={closeAll}
							class="rounded-md border border-line px-4 py-2.5 text-center text-base font-medium text-muted transition-colors hover:text-default"
						>
							Dashboard
						</a>
						<form method="POST" action="/auth/logout">
							<button
								type="submit"
								class="w-full rounded-md bg-action px-4 py-2.5 text-center text-sm font-semibold text-action-fg transition-opacity hover:opacity-90"
							>
								Log out
							</button>
						</form>
					{:else}
						<a
							href={resolve('/auth/login')}
							onclick={closeAll}
							class="rounded-md border border-line px-4 py-2.5 text-center text-base font-medium text-muted transition-colors hover:text-default"
						>
							Sign in
						</a>
						<a
							href={resolve('/auth/signup')}
							onclick={closeAll}
							class="rounded-md bg-brand px-4 py-2.5 text-center text-sm font-semibold text-brand-fg transition-colors hover:bg-brand-hover"
						>
							Get started
						</a>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</header>

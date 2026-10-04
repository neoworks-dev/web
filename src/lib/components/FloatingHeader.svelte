<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';
	import { fly } from 'svelte/transition';
	import CaretDownIcon from 'phosphor-svelte/lib/CaretDownIcon';
	import ListIcon from 'phosphor-svelte/lib/ListIcon';
	import XIcon from 'phosphor-svelte/lib/XIcon';
	import MegaMenu from './MegaMenu.svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import ProfileMenu from './ProfileMenu.svelte';
	import DocsHeader from './docs/DocsHeader.svelte';
	import LatentSubnav from './latent/LatentSubnav.svelte';
	import VitalsSubnav from './vitals/VitalsSubnav.svelte';
	import { flagships, projectQuickLinks } from '$lib/data/projects';

	// On docs pages the header grows a second row of product tabs, TensorFlow-style.
	const isDocs = $derived($page.url.pathname.startsWith('/docs'));

	// The Latent site reuses this header with its own second row. Matched on the
	// route rather than the path, because on latent.<base-domain> the URL is `/`.
	const isLatent = $derived(Boolean($page.route.id?.startsWith('/latent')));

	// Same arrangement for the Vitals site on vitals.<base-domain>.
	const isVitals = $derived(Boolean($page.route.id?.startsWith('/dev/vitals')));

	const hasSubnav = $derived(isDocs || isLatent || isVitals);

	interface User {
		email?: string;
		name?: string;
		picture?: string;
	}

	let { user = null }: { user?: User | null } = $props();

	const navLinks = [
		{ label: 'Docs', href: '/docs' },
		{ label: 'Pricing', href: '/pricing' }
	];

	let projectsOpen = $state(false);
	let mobileOpen = $state(false);

	function openProjects() {
		projectsOpen = true;
	}
	function closeMega() {
		projectsOpen = false;
	}
	function closeAll() {
		closeMega();
		mobileOpen = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') closeAll();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<header class="pointer-events-none fixed inset-x-0 top-2 z-nav flex justify-center">
	<!-- Dock: groups the bar and the mega panel so hover-intent spans both. -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="pointer-events-none flex flex-col items-center px-6 max-md:px-0 w-[min(1320px,calc(100vw-2rem))] " onmouseleave={closeMega}>
		<!-- Header card: the pill, plus an attached sub-nav row on docs pages. -->
		<div
			class="pointer-events-auto border w-full border-line bg-elevated/80 shadow-lg backdrop-blur-xl backdrop-saturate-150 {hasSubnav
				? 'rounded-[26px]'
				: 'rounded-full'}"
		>
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
				<button
					type="button"
					aria-expanded={projectsOpen}
					aria-haspopup="true"
					onmouseenter={openProjects}
					onclick={() => (projectsOpen ? closeMega() : openProjects())}
					class="flex items-center gap-1 rounded-full px-3.5 py-2 text-base font-medium text-muted transition-colors hover:bg-hover hover:text-default"
					class:text-default={projectsOpen}
					class:bg-hover={projectsOpen}
				>
					Projects
					<CaretDownIcon
						size={12}
						weight="bold"
						class="transition-transform duration-200 {projectsOpen ? 'rotate-180' : ''}"
					/>
				</button>
				{#each navLinks as link}
					<a
						href={link.href}
						onmouseenter={closeMega}
						class="rounded-full px-3.5 py-2 text-base font-medium text-muted transition-colors hover:bg-hover hover:text-default"
					>
						{link.label}
					</a>
				{/each}
			</div>

			<!-- Actions (desktop) -->
			<div class="ml-auto hidden items-center gap-1.5 md:flex">
				<ThemeToggle class="h-9 w-9" />
				{#if user}
					<ProfileMenu {user} />
				{:else}
					<a
						href={resolve('/auth/login')}
						class="rounded-full px-3.5 py-2 text-base font-medium text-muted transition-colors hover:text-default"
					>
						Sign in
					</a>
					<a
						href={resolve('/auth/signup')}
						class="rounded-full bg-action px-4 py-2 text-sm font-semibold text-action-fg transition-opacity hover:opacity-90 active:scale-[0.98]"
					>
						Get started
					</a>
				{/if}
			</div>

			<!-- Mobile actions -->
			<ThemeToggle class="ml-auto md:hidden" />
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

		<!-- Mega menus (desktop) — full width, span the header dock -->
		{#if projectsOpen}
			<div class="pointer-events-auto hidden w-full pt-2 md:block">
				<MegaMenu onNavigate={closeAll} />
			</div>
		{/if}

		<!-- Mobile menu -->
		{#if mobileOpen}
			<div
				transition:fly={{ y: -6, duration: 180 }}
				class="pointer-events-auto mt-2 max-h-[70vh] w-[min(92vw,420px)] overflow-y-auto rounded-2xl border border-line bg-elevated/95 p-4 shadow-[var(--shadow-overlay)] backdrop-blur-xl md:hidden"
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

				<!-- Projects flagships -->
				<div class="mt-4 border-t border-line-faint pt-3">
					<h3
						class="mb-2 ml-1 text-2xs font-medium uppercase tracking-[0.12em] text-faint [font-family:var(--font-mono)]"
					>
						Projects
					</h3>
					<div class="grid grid-cols-2 gap-0.5">
						{#each flagships as flagship}
							{@const Icon = flagship.icon}
							<a
								href={flagship.href}
								target={flagship.external ? '_blank' : undefined}
								rel={flagship.external ? 'noopener noreferrer' : undefined}
								onclick={closeAll}
								class="flex items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-hover"
							>
								<span
									class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border"
									style="background: color-mix(in oklab, {flagship.accent} 14%, transparent); border-color: color-mix(in oklab, {flagship.accent} 28%, transparent);"
								>
									<Icon size={15} weight="duotone" color={flagship.accent} />
								</span>
								<span class="truncate text-sm font-medium text-default">{flagship.name}</span>
							</a>
						{/each}
						{#each projectQuickLinks as link}
							{@const Icon = link.icon}
							<a
								href={link.href}
								onclick={closeAll}
								class="flex items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-hover"
							>
								<span
									class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border"
									style="background: color-mix(in oklab, {link.accent} 14%, transparent); border-color: color-mix(in oklab, {link.accent} 28%, transparent);"
								>
									<Icon size={15} weight="duotone" color={link.accent} />
								</span>
								<span class="truncate text-sm font-medium text-default">{link.name}</span>
							</a>
						{/each}
					</div>
				</div>

				<div class="mt-4 flex flex-col gap-2 border-t border-line-faint pt-4">
					{#if user}
						<a
							href="/dashboard"
							onclick={closeAll}
							class="rounded-full border border-line px-4 py-2.5 text-center text-base font-medium text-muted transition-colors hover:text-default"
						>
							Dashboard
						</a>
						<form method="POST" action="/auth/logout">
							<button
								type="submit"
								class="w-full rounded-full bg-action px-4 py-2.5 text-center text-sm font-semibold text-action-fg transition-opacity hover:opacity-90"
							>
								Log out
							</button>
						</form>
					{:else}
						<a
							href={resolve('/auth/login')}
							onclick={closeAll}
							class="rounded-full border border-line px-4 py-2.5 text-center text-base font-medium text-muted transition-colors hover:text-default"
						>
							Sign in
						</a>
						<a
							href={resolve('/auth/signup')}
							onclick={closeAll}
							class="rounded-full bg-action px-4 py-2.5 text-center text-sm font-semibold text-action-fg transition-opacity hover:opacity-90"
						>
							Get started
						</a>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</header>

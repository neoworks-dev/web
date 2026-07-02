<script lang="ts">
	import { CaretLeft, CaretUpDown, Check } from 'phosphor-svelte';
	import BuildingsIcon from 'phosphor-svelte/lib/BuildingsIcon';
	import type { Snippet } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { sdk } from '$lib/sdk';
	import type { Organization } from '@neoworks-dev/sdk';
	import ThemeSwitch from './ThemeSwitch.svelte';
	import { viewScope, setViewScope, scopeHome } from '$lib/context/viewScope.svelte';

	interface User {
		email: string;
		name?: string;
		sub?: string;
	}

	// Shared sidebar chrome: logo, the scrollable content region (provided by the
	// view via `children`), the theme + collapse controls, and the view-scope
	// switcher. Every sidebar view builds on top of this shell.
	let {
		user,
		collapsed = $bindable(false),
		mobileOpen = $bindable(false),
		children,
	}: { user: User; collapsed: boolean; mobileOpen?: boolean; children: Snippet } = $props();

	// ── View scope (personal vs an organization) ────────────────────────────────
	let organizations = $state<Organization[]>([]);
	let scopeMenuOpen = $state(false);
	// Caller's role per org, resolved lazily and reused.
	let roleByOrg = $state<Record<string, string>>({});

	sdk.organizations
		.list()
		.then((res) => (organizations = res))
		.catch(() => {});

	// The active org id, if the current route is inside an organization (but not
	// the org-creation wizard under /organizations/new).
	const routeOrgId = $derived.by(() => {
		const path = $page.url.pathname;
		if (!path.startsWith('/dashboard/organizations/')) return null;
		if (path.startsWith('/dashboard/organizations/new')) return null;
		return $page.params.id ?? null;
	});

	// Keep the shared scope in sync with the route so the footer always reflects
	// where the user actually is, however they navigated there.
	$effect(() => {
		const orgId = routeOrgId;
		if (!orgId) {
			if (viewScope.current.type !== 'personal') setViewScope({ type: 'personal' });
			return;
		}
		const org = organizations.find((o) => o.id === orgId);
		const name = org?.name ?? 'Organization';
		const role = roleByOrg[orgId];
		const current = viewScope.current;
		if (current.type !== 'org' || current.id !== orgId || current.name !== name || current.role !== role) {
			setViewScope({ type: 'org', id: orgId, name, role });
		}
		if (role === undefined) resolveRole(orgId);
	});

	async function resolveRole(orgId: string) {
		try {
			const members = await sdk.organizations.members(orgId);
			const mine = members.find((m) => m.user_id === user.sub);
			roleByOrg[orgId] = mine?.role ?? '';
		} catch {
			roleByOrg[orgId] = '';
		}
	}

	const scope = $derived(viewScope.current);
	const currentOrg = $derived(
		scope.type === 'org' ? organizations.find((o) => o.id === scope.id) : null,
	);
	const username = $derived(user.name ?? user.email?.split('@')[0] ?? '');

	function titleCase(value: string): string {
		return value.charAt(0).toUpperCase() + value.slice(1);
	}

	const scopeSubtitle = $derived(
		scope.type === 'org'
			? scope.role
				? `${scope.name} · ${titleCase(scope.role)}`
				: scope.name
			: (user.email ?? ''),
	);

	function selectPersonal() {
		scopeMenuOpen = false;
		goto(scopeHome({ type: 'personal' }));
	}

	function selectOrg(org: Organization) {
		scopeMenuOpen = false;
		goto(scopeHome({ type: 'org', id: org.id, name: org.name }));
	}

	function initials(u: User): string {
		if (u.name) return u.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
		return u.email?.[0].toUpperCase() ?? '';
	}
</script>

<aside
  class="flex flex-col bg-elevated border border-line-faint overflow-hidden rounded-lg shrink-0
         transition-[translate,width] duration-slow ease-out
         fixed inset-y-2 right-2 z-50 w-[220px]
         md:static md:inset-auto md:right-auto md:z-10 md:translate-x-0
         {collapsed ? 'md:w-16' : 'md:w-[220px]'}"
  class:translate-x-0={mobileOpen}
  class:translate-x-[120%]={!mobileOpen}
>
  <!-- Logo -->
  <div
    class="flex items-center gap-2 h-[56px] border-b border-line-faint shrink-0 transition-[padding] duration-slow"
    class:px-5={!collapsed}
    class:justify-center={collapsed}
  >
    <span class="shrink-0 text-default">
      <svg width="26" height="26" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="7" />
        <path d="M 81 27 C 73 51, 55 69, 26 74" stroke="currentColor" stroke-width="7" stroke-linecap="round" />
      </svg>
    </span>
    {#if !collapsed}
      <span class="text-base font-semibold tracking-tight text-default whitespace-nowrap">NeoWorks</span>
    {/if}
  </div>

  <!-- View content (main nav or an org panel) -->
  <div class="flex-1 min-h-0 flex flex-col overflow-hidden">
    {@render children()}
  </div>

  <!-- Shared controls: theme + collapse (present in every view) -->
  <div class="shrink-0 px-2 pb-1 flex flex-col gap-0.5">
    <ThemeSwitch {collapsed} />
    <button
      type="button"
      onclick={() => (collapsed = !collapsed)}
      class="hidden md:flex items-center gap-[10px] h-9 px-2 rounded-md text-[13px] text-dim hover:bg-hover hover:text-muted transition-colors w-full"
      class:justify-center={collapsed}
    >
      <span
        class="flex shrink-0 w-[18px] h-[18px] items-center justify-center transition-transform duration-slow"
        class:rotate-180={collapsed}
      >
        <CaretLeft size={16} />
      </span>
      {#if !collapsed}
        <span class="whitespace-nowrap">Collapse</span>
      {/if}
    </button>
  </div>

  <!-- User footer / view-scope switcher -->
  <div class="relative shrink-0 border-t border-line-faint p-2">
    {#if scopeMenuOpen}
      <button type="button" aria-label="Close menu" class="fixed inset-0 z-40" onclick={() => (scopeMenuOpen = false)}></button>
      <div class="absolute bottom-full left-2 right-2 mb-1 z-50 rounded-lg border border-line bg-elevated shadow-lg overflow-hidden py-1">
        <p class="px-3 pt-1.5 pb-1 text-[11px] font-mono uppercase tracking-caps text-dim">Switch view</p>
        <button
          type="button"
          onclick={selectPersonal}
          class="flex items-center gap-2.5 w-full px-3 py-2 text-left hover:bg-hover transition-colors"
        >
          <span class="w-[26px] h-[26px] rounded-full bg-raised border border-line-faint flex items-center justify-center text-[10px] font-semibold text-muted shrink-0">
            {initials(user)}
          </span>
          <span class="min-w-0 flex-1">
            <span class="block text-[13px] text-default leading-tight truncate">Personal</span>
            <span class="block text-[11px] text-dim leading-tight truncate">{user.email}</span>
          </span>
          {#if scope.type === 'personal'}<Check size={14} class="text-primary shrink-0" />{/if}
        </button>

        {#if organizations.length > 0}
          <div class="h-px bg-line-faint my-1"></div>
          {#each organizations as org (org.id)}
            <button
              type="button"
              onclick={() => selectOrg(org)}
              class="flex items-center gap-2.5 w-full px-3 py-2 text-left hover:bg-hover transition-colors"
            >
              {#if org.logo_url}
                <img src={org.logo_url} alt={org.name} class="w-[26px] h-[26px] rounded-lg object-cover border border-line-faint shrink-0" />
              {:else}
                <span class="w-[26px] h-[26px] rounded-lg bg-raised border border-line-faint flex items-center justify-center text-dim shrink-0">
                  <BuildingsIcon size={14} />
                </span>
              {/if}
              <span class="min-w-0 flex-1">
                <span class="block text-[13px] text-default leading-tight truncate">{org.name}</span>
                <span class="block text-[11px] text-dim leading-tight truncate">Organization</span>
              </span>
              {#if scope.type === 'org' && scope.id === org.id}<Check size={14} class="text-primary shrink-0" />{/if}
            </button>
          {/each}
        {/if}
      </div>
    {/if}

    <button
      type="button"
      onclick={() => (scopeMenuOpen = !scopeMenuOpen)}
      class="flex items-center gap-[10px] w-full p-2 rounded-md hover:bg-hover transition-colors overflow-hidden"
      class:justify-center={collapsed}
    >
      {#if scope.type === 'org'}
        {#if currentOrg?.logo_url}
          <img src={currentOrg.logo_url} alt={scope.name} class="w-[30px] h-[30px] rounded-lg object-cover border border-line-faint shrink-0" />
        {:else}
          <div class="w-[30px] h-[30px] rounded-lg bg-raised border border-line-faint flex items-center justify-center text-muted shrink-0">
            <BuildingsIcon size={16} />
          </div>
        {/if}
      {:else}
        <div class="relative w-[30px] h-[30px] rounded-full bg-raised border border-line-faint flex items-center justify-center text-[11px] font-semibold text-muted shrink-0 select-none">
          {initials(user)}
          <span class="absolute right-[-1px] bottom-[-1px] w-2 h-2 rounded-full bg-green border-2 border-elevated"></span>
        </div>
      {/if}
      {#if !collapsed}
        <div class="min-w-0 flex-1 text-left space-y-1">
          <p class="text-[13px] font-medium text-default leading-none truncate">{username}</p>
          <p class="text-xs text-dim leading-none truncate">{scopeSubtitle}</p>
        </div>
        <CaretUpDown size={15} class="text-dim shrink-0" />
      {/if}
    </button>
  </div>
</aside>

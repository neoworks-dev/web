<script lang="ts">
	import {
		House,
		Table,
		HardDrive,
		PlugsConnected,
		Key,
		Code,
		SlidersHorizontal,
		UsersThree,
		ShieldCheck,
		CaretLeft,
		ArrowLeft,
	} from 'phosphor-svelte';
	import BuildingsIcon from 'phosphor-svelte/lib/BuildingsIcon';
	import { page } from '$app/stores';
	import { overlayScroll } from '$lib/actions/overlayScroll';
	import { urls } from '$lib/urls';
	import ThemeSwitch from './ThemeSwitch.svelte';
	import type { ViewContext } from '$lib/context/viewContext.svelte.js';

	interface User {
		email: string;
		name?: string;
	}

	let {
		user,
		collapsed = $bindable(false),
		mobileOpen = $bindable(false),
		viewCtx = null,
	}: { user: User; collapsed: boolean; mobileOpen?: boolean; viewCtx?: ViewContext | null } = $props();

	const hasPanel = $derived(!!viewCtx?.sidebarPanel);

	const groups: Array<{
		label: string | null;
		items: Array<{ href: string; label: string; Icon: any; badge?: number }>;
	}> = [
		{
			label: null,
			items: [
				{ href: '/dashboard', label: 'Home', Icon: House },
			],
		},
		{
			label: 'Data & Resources',
			items: [
				{ href: '/dashboard/organizations', label: 'Organizations', Icon: BuildingsIcon },
				{ href: '/dashboard/data',         label: 'Data',         Icon: Table        },
				{ href: '/dashboard/storage',      label: 'Storage',      Icon: HardDrive    },
			],
		},
		{
			label: 'Access & Integrations',
			items: [
				{ href: '/dashboard/connected-apps',     label: 'Connected Apps',     Icon: PlugsConnected },
				{ href: '/dashboard/oauth-applications', label: 'OAuth Applications', Icon: Key            },
				{ href: '/dashboard/api-tokens',         label: 'API Tokens',         Icon: Code           },
			],
		},
		{
			label: 'Settings',
			items: [
				{ href: '/dashboard/preferences',  label: 'Preferences',   Icon: SlidersHorizontal },
				{ href: '/dashboard/team-billing', label: 'Team & Billing', Icon: UsersThree        },
				{ href: `${urls.oauth}/account/security`, label: 'Security & Devices', Icon: ShieldCheck },
			],
		},
	];

	function isActive(href: string): boolean {
		if (href === '/dashboard') return $page.url.pathname === '/dashboard';
		return $page.url.pathname.startsWith(href);
	}

	function initials(u: User): string {
		if (u.name) return u.name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
		return u.email?.[0].toUpperCase() ?? '';
	}
</script>

<aside
  class="flex flex-col bg-elevated border border-line-faint overflow-hidden rounded-lg shrink-0
         transition-[translate,width] duration-slow ease-out
         fixed inset-y-2 right-2 z-50 w-56
         md:static md:inset-auto md:right-auto md:z-10 md:translate-x-0
         {collapsed ? 'md:w-16' : 'md:w-56'}"
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
        <path
          d="M 81 27 C 73 51, 55 69, 26 74"
          stroke="currentColor"
          stroke-width="7"
          stroke-linecap="round"
        />
      </svg>
    </span>
    {#if !collapsed}
      <span class="text-base font-semibold tracking-tight text-default whitespace-nowrap">
        NeoWorks
      </span>
    {/if}
  </div>

  {#if hasPanel && viewCtx}
    {@const { component: Panel, props, onback, label } = viewCtx.sidebarPanel!}

    <!-- Back button -->
    <button
      type="button"
      onclick={() => onback ? onback() : viewCtx!.setSidebarPanel(null)}
      class="flex items-center gap-2 h-9 px-3 mx-2 mt-1.5 rounded-md text-[13px] text-muted hover:bg-hover hover:text-default transition-colors w-[calc(100%-16px)] shrink-0"
      class:justify-center={collapsed}
    >
      <span class="flex shrink-0 w-4 h-4 items-center justify-center">
        <ArrowLeft size={15} />
      </span>
      {#if !collapsed}
        <span class="whitespace-nowrap overflow-hidden">
          {label ?? 'Back'}
        </span>
      {/if}
    </button>

    <!-- Panel content -->
    <div class="flex-1 min-h-0 border-t border-line-faint mt-1.5 overflow-y-auto">
      <Panel {...props()} />
    </div>

  {:else}
    <!-- Normal nav -->
    <nav
      use:overlayScroll
      class="relative flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 flex flex-col gap-0.5"
    >
      {#each groups as group, gi}
        {#if group.label && !collapsed}
          <div class="flex items-center h-7 px-2 mt-2 mb-px">
            <span class="font-mono text-[11px] text-dim uppercase tracking-caps whitespace-nowrap">
              {group.label}
            </span>
          </div>
        {/if}

        {#each group.items as { href, label, Icon, badge }}
          {@const active = isActive(href)}
          <a
            {href}
            title={collapsed ? label : undefined}
            onclick={() => (mobileOpen = false)}
            class="flex items-center gap-2 h-9 px-2 rounded-md text-[13px] font-medium transition-colors duration-fast
                    {active
              ? 'bg-raised text-default'
              : 'text-muted hover:bg-hover hover:text-default'}"
            class:justify-center={collapsed}
          >
            <span class="flex shrink-0 w-5 h-5 items-center justify-center">
              <Icon size={17} weight={active ? "fill" : "regular"} />
            </span>
            {#if !collapsed}
              <span class="flex-1 whitespace-nowrap overflow-hidden">
                {label}
              </span>
              {#if badge != null}
                <span class="font-mono text-[10px] text-dim bg-raised border border-line-faint rounded-full px-4 h-5 flex items-center shrink-0">
                  {badge}
                </span>
              {/if}
            {/if}
          </a>
        {/each}

        {#if gi < groups.length - 1}
          <div class="h-px bg-line-faint my-2 mx-2"></div>
        {/if}
      {/each}

      <div class="flex-1"></div>

      <ThemeSwitch {collapsed} />

      <!-- Collapse toggle -->
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
    </nav>
  {/if}

  <!-- User footer -->
  <div class="shrink-0 border-t border-line-faint p-2">
    <button
      type="button"
      class="flex items-center gap-[10px] w-full p-2 rounded-md hover:bg-hover transition-colors overflow-hidden"
      class:justify-center={collapsed}
    >
      <div
        class="relative w-[30px] h-[30px] rounded-full bg-raised border border-line-faint flex items-center justify-center text-[11px] font-semibold text-muted shrink-0 select-none"
      >
        {initials(user)}
        <span
          class="absolute right-[-1px] bottom-[-1px] w-2 h-2 rounded-full bg-green border-2 border-elevated"
        ></span>
      </div>
      {#if !collapsed}
        <div class="min-w-0 flex-1 text-left">
          <p class="text-[13px] font-medium text-default leading-tight truncate">
            {user.name ?? user.email?.split("@")[0]}
          </p>
          <p class="text-xs text-dim leading-tight">Free plan</p>
        </div>
      {/if}
    </button>
  </div>
</aside>

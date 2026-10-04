<script lang="ts">
	import { CaretLeft } from 'phosphor-svelte';
	import type { Snippet } from 'svelte';
	import ThemeSwitch from './ThemeSwitch.svelte';

	interface User {
		email: string;
		name?: string;
		sub?: string;
	}

	// Shared sidebar chrome: logo, the scrollable content region (provided by the
	// view via `children`), the theme + collapse controls and the user footer.
	let {
		user,
		collapsed = $bindable(false),
		mobileOpen = $bindable(false),
		children,
	}: { user: User; collapsed: boolean; mobileOpen?: boolean; children: Snippet } = $props();

	const username = $derived(user.name ?? user.email?.split('@')[0] ?? '');

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

  <!-- View content -->
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

  <!-- User footer -->
  <div class="shrink-0 border-t border-line-faint p-2">
    <div
      class="flex items-center gap-[10px] w-full p-2 overflow-hidden"
      class:justify-center={collapsed}
    >
      <div class="relative w-[30px] h-[30px] rounded-full bg-raised border border-line-faint flex items-center justify-center text-[11px] font-semibold text-muted shrink-0 select-none">
        {initials(user)}
        <span class="absolute right-[-1px] bottom-[-1px] w-2 h-2 rounded-full bg-green border-2 border-elevated"></span>
      </div>
      {#if !collapsed}
        <div class="min-w-0 flex-1 text-left space-y-1">
          <p class="text-[13px] font-medium text-default leading-none truncate">{username}</p>
          <p class="text-xs text-dim leading-none truncate">{user.email}</p>
        </div>
      {/if}
    </div>
  </div>
</aside>

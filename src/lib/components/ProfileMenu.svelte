<script lang="ts">
	import { fly } from 'svelte/transition';
	import HouseIcon from 'phosphor-svelte/lib/HouseIcon';
	import BookOpenIcon from 'phosphor-svelte/lib/BookOpenIcon';
	import SlidersHorizontalIcon from 'phosphor-svelte/lib/SlidersHorizontalIcon';
	import ShieldCheckIcon from 'phosphor-svelte/lib/ShieldCheckIcon';
	import SignOutIcon from 'phosphor-svelte/lib/SignOutIcon';
	import { urls } from '$lib/urls';

	interface User {
		email?: string;
		name?: string;
		picture?: string;
	}

	let { user }: { user: User } = $props();

	let open = $state(false);

	const links = [
		{ label: 'Dashboard', href: '/dashboard', Icon: HouseIcon },
		{ label: 'Preferences', href: '/dashboard/preferences', Icon: SlidersHorizontalIcon },
		{ label: 'Documentation', href: '/docs', Icon: BookOpenIcon },
		{
			label: 'Security & Devices',
			href: `${urls.oauth}/account/security`,
			Icon: ShieldCheckIcon
		}
	];

	const displayName = $derived(user.name ?? user.email?.split('@')[0] ?? 'Account');

	function initials(): string {
		if (user.name) {
			return user.name
				.split(' ')
				.map((part) => part[0])
				.slice(0, 2)
				.join('')
				.toUpperCase();
		}
		return user.email?.[0]?.toUpperCase() ?? '';
	}

	function close() {
		open = false;
	}

	// Close when clicking anywhere outside the menu (capture phase so it fires before
	// inner handlers stop propagation).
	function clickOutside(node: HTMLElement) {
		function handle(event: MouseEvent) {
			if (!node.contains(event.target as Node)) close();
		}
		document.addEventListener('click', handle, true);
		return {
			destroy() {
				document.removeEventListener('click', handle, true);
			}
		};
	}
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && close()} />

<div class="relative" use:clickOutside>
	<button
		type="button"
		aria-haspopup="menu"
		aria-expanded={open}
		aria-label="Account menu"
		onclick={() => (open = !open)}
		class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-line bg-raised text-[12px] font-semibold text-muted transition-colors hover:border-line-strong hover:text-default
			{open ? 'border-line-strong text-default' : ''}"
	>
		{#if user.picture}
			<img src={user.picture} alt="" class="h-full w-full object-cover" />
		{:else}
			{initials()}
		{/if}
	</button>

	{#if open}
		<div
			role="menu"
			transition:fly={{ y: -6, duration: 160 }}
			class="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-line bg-elevated/95 p-2 shadow-[var(--shadow-overlay)] backdrop-blur-xl"
		>
			<!-- Identity -->
			<div class="flex items-center gap-2.5 px-2 py-2">
				<div
					class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-raised text-[11px] font-semibold text-muted"
				>
					{#if user.picture}
						<img src={user.picture} alt="" class="h-full w-full object-cover" />
					{:else}
						{initials()}
					{/if}
				</div>
				<div class="min-w-0">
					<p class="truncate text-[13px] font-medium text-default">{displayName}</p>
					{#if user.email}
						<p class="truncate text-xs text-dim">{user.email}</p>
					{/if}
				</div>
			</div>

			<div class="my-1 h-px bg-line-faint"></div>

			<!-- Navigation -->
			{#each links as { label, href, Icon }}
				<a
					{href}
					role="menuitem"
					onclick={close}
					class="flex items-center gap-2.5 rounded-md px-2 py-2 text-[13px] font-medium text-muted transition-colors hover:bg-hover hover:text-default"
				>
					<span class="flex h-4 w-4 shrink-0 items-center justify-center">
						<Icon size={16} />
					</span>
					{label}
				</a>
			{/each}

			<div class="my-1 h-px bg-line-faint"></div>

			<!-- Logout -->
			<form method="POST" action="/auth/logout">
				<button
					type="submit"
					role="menuitem"
					class="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-[13px] font-medium text-muted transition-colors hover:bg-hover hover:text-default"
				>
					<span class="flex h-4 w-4 shrink-0 items-center justify-center">
						<SignOutIcon size={16} />
					</span>
					Log out
				</button>
			</form>
		</div>
	{/if}
</div>

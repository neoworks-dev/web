<script lang="ts">
	import TrashIcon from 'phosphor-svelte/lib/TrashIcon';
	import KeyIcon from 'phosphor-svelte/lib/KeyIcon';
	import { sdk } from '$lib/sdk';
	import type { RefreshToken } from '@neoworks-dev/sdk';

	let tokens = $state<RefreshToken[]>([]);
	let loading = $state(true);

	sdk.refreshTokens.list().then(res => {
		tokens = res;
		loading = false;
	});

	function fmt(dateStr: string | null | undefined): string {
		if (!dateStr) return '—';
		return new Date(dateStr).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
		});
	}

	function isExpired(dateStr: string | null | undefined): boolean {
		if (!dateStr) return false;
		return new Date(dateStr) < new Date();
	}

	async function revoke(id: string) {
		await sdk.refreshTokens.revoke(id);
    tokens.map(token => {
      if (token.id === id) {
        token.revoked = true
      }
    })
	}
</script>

<div>
  {#if loading}
    <div class="p-6 space-y-2">
      {#each { length: 3 } as _}
        <div class="skeleton h-10 w-full rounded-lg"></div>
      {/each}
    </div>
  {:else if tokens.length === 0}
    <div class="flex flex-col items-center justify-center py-12 text-center">
      <KeyIcon size={28} class="text-dim mb-3" />
      <p class="text-sm font-medium text-muted">No refresh tokens</p>
      <p class="text-xs text-dim mt-1">
        Tokens will appear here after you authenticate.
      </p>
    </div>
  {:else}
    <table class="w-full text-[13px]">
      <thead>
        <tr>
          <th
            class="sticky top-0 z-10 bg-surface px-4 py-2.5 text-left font-medium text-dim uppercase tracking-caps text-[11px] border-b border-line-faint"
            >Client</th
          >
          <th
            class="sticky top-0 z-10 bg-surface px-4 py-2.5 text-left font-medium text-dim uppercase tracking-caps text-[11px] border-b border-line-faint"
            >Scopes</th
          >
          <th
            class="sticky top-0 z-10 bg-surface px-4 py-2.5 text-left font-medium text-dim uppercase tracking-caps text-[11px] border-b border-line-faint"
            >Created</th
          >
          <th
            class="sticky top-0 z-10 bg-surface px-4 py-2.5 text-left font-medium text-dim uppercase tracking-caps text-[11px] border-b border-line-faint"
            >Expires</th
          >
          <th
            class="sticky top-0 z-10 bg-surface px-4 py-2.5 text-left font-medium text-dim uppercase tracking-caps text-[11px] border-b border-line-faint"
            >Status</th
          >
          <th class="sticky top-0 z-10 bg-surface px-4 py-2.5 border-b border-line-faint"></th>
        </tr>
      </thead>
      <tbody>
        {#each tokens as token (token.id)}
          <tr
            class="border-b border-line-faint last:border-0 hover:bg-hover transition-colors duration-fast"
          >
            <td class="px-4 py-3 font-mono text-[12px] text-muted"
              >{token.client.id}</td
            >
            <td class="px-4 py-3">
              <div class="flex flex-wrap gap-1">
                {#each token.scopes as scope}
                  <span
                    class="font-mono text-[10px] px-1.5 py-0.5 rounded bg-raised border border-line-faint text-muted"
                    >{scope}</span
                  >
                {/each}
              </div>
            </td>
            <td class="px-4 py-3 text-muted">{fmt(token.created_at)}</td>
            <td class="px-4 py-3">
              {#if isExpired(token.expires_at)}
                <span class="text-red text-[12px] font-medium"
                  >Expired {fmt(token.expires_at)}</span
                >
              {:else}
                <span class="text-muted">{fmt(token.expires_at)}</span>
              {/if}
            </td>
            <td class="px-4 py-3">
              {#if token.revoked}
                <span class="text-[11px] font-medium text-red">Revoked</span>
              {:else if token.used}
                <span class="text-[11px] font-medium text-dim">Used</span>
              {:else}
                <span class="text-[11px] font-medium text-green">Active</span>
              {/if}
            </td>
            <td class="px-4 py-3">
              <button
                type="button"
                onclick={() => revoke(token.id)}
                class="flex items-center gap-1.5 h-7 px-2.5 rounded text-[12px] text-dim hover:text-red hover:bg-red-soft border border-transparent hover:border-red/20 transition-colors duration-fast"
              >
                <TrashIcon size={13} />
                Revoke
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

<script lang="ts">
	// Pricing constants — confirm before going live.
	const SEAT = 2; // € per user / month
	const INCLUDED_PER_USER = 5; // GB included per seat

	// Storage is billed at cost. NeoWorks auto-tiers data across hot/warm/cold, so you pay a
	// blend rather than a single hot rate. Rates are EUR approximations of real object storage:
	// hot ≈ Cloudflare R2 standard ($0.015), warm ≈ R2 infrequent ($0.010), cold ≈ Backblaze B2 ($0.005).
	const TIERS = [
		{ name: 'Hot', rate: 0.014, share: 0.1 },
		{ name: 'Warm', rate: 0.009, share: 0.25 },
		{ name: 'Cold', rate: 0.005, share: 0.65 }
	];
	const BLENDED = TIERS.reduce((sum, t) => sum + t.rate * t.share, 0); // ≈ €0.0069 / GB / mo

	let users = $state(1);
	let storageGb = $state(1000); // default to 1 TB so the terabyte cost is visible up front

	const included = $derived(users * INCLUDED_PER_USER);
	const billable = $derived(Math.max(0, storageGb - included));
	const seatCost = $derived(users * SEAT);
	const storageCost = $derived(billable * BLENDED);
	const total = $derived(seatCost + storageCost);

	const eur = (n: number) => '€' + n.toFixed(2);
	const rate = (n: number) => '€' + n.toFixed(3);
	function storageLabel(gb: number): string {
		if (gb >= 1000) return (gb / 1000).toFixed(gb % 1000 === 0 ? 0 : 1) + ' TB';
		return gb + ' GB';
	}

	const presets = [
		{ label: '100 GB', gb: 100 },
		{ label: '500 GB', gb: 500 },
		{ label: '1 TB', gb: 1000 },
		{ label: '5 TB', gb: 5000 }
	];
</script>

<div class="mx-auto max-w-[680px] rounded-2xl border border-line bg-elevated/60 p-7 max-md:p-5">
	<div class="grid grid-cols-2 gap-8 max-md:grid-cols-1 max-md:gap-6">
		<!-- Controls -->
		<div class="flex flex-col gap-6">
			<div>
				<div class="flex items-baseline justify-between">
					<label for="est-users" class="text-sm font-medium text-default">Users</label>
					<span class="font-mono text-sm text-muted">{users}</span>
				</div>
				<input
					id="est-users"
					type="range"
					min="1"
					max="50"
					step="1"
					bind:value={users}
					class="mt-3 w-full [accent-color:var(--text)]"
				/>
			</div>

			<div>
				<div class="flex items-baseline justify-between">
					<label for="est-storage" class="text-sm font-medium text-default">Storage</label>
					<span class="font-mono text-sm text-muted">{storageLabel(storageGb)}</span>
				</div>
				<input
					id="est-storage"
					type="range"
					min="0"
					max="5000"
					step="10"
					bind:value={storageGb}
					class="mt-3 w-full [accent-color:var(--text)]"
				/>
				<div class="mt-3 flex flex-wrap gap-1.5">
					{#each presets as preset}
						<button
							type="button"
							onclick={() => (storageGb = preset.gb)}
							class="rounded-full border px-2.5 py-1 font-mono text-[11px] transition-colors {storageGb ===
							preset.gb
								? 'border-line-strong bg-hover text-default'
								: 'border-line-faint text-dim hover:text-default'}"
						>
							{preset.label}
						</button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Breakdown -->
		<div class="flex flex-col rounded-xl border border-line-faint bg-surface/60 p-5">
			<div class="flex flex-col gap-2 text-sm">
				<div class="flex items-center justify-between">
					<span class="text-muted">{users} × €2 seat</span>
					<span class="font-mono text-default">{eur(seatCost)}</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-muted">{included} GB included</span>
					<span class="font-mono text-dim">€0.00</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-muted">{billable} GB × {rate(BLENDED)}</span>
					<span class="font-mono text-default">{eur(storageCost)}</span>
				</div>
			</div>

			<div class="my-4 h-px bg-line-faint"></div>

			<div class="flex items-baseline justify-between">
				<span class="text-sm text-muted">Per month</span>
				<span class="text-3xl font-semibold tracking-tight text-default">{eur(total)}</span>
			</div>
			<p class="mt-1 text-right font-mono text-2xs text-faint">
				≈ {eur(total * 12)} / year
			</p>
		</div>
	</div>

	<!-- Tiering explainer -->
	<div class="mt-6 border-t border-line-faint pt-5">
		<div class="flex flex-wrap items-center justify-center gap-2">
			{#each TIERS as tier}
				<span
					class="inline-flex items-center gap-1.5 rounded-full border border-line-faint bg-raised px-2.5 py-1 font-mono text-[11px] text-dim"
				>
					<span class="text-muted">{tier.name}</span>
					{rate(tier.rate)}/GB
				</span>
			{/each}
		</div>
		<p class="mt-3 text-center text-2xs text-dim">
			NeoWorks automatically moves your data across hot, warm and cold storage, so you pay a
			blended at-cost rate (~{rate(BLENDED)} / GB / month) instead of a single hot tier — and never
			a markup.
		</p>
	</div>
</div>

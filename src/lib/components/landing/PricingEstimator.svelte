<script lang="ts">
	const monthlySeatPrice = 2.99;
	const yearlySeatPrice = 29.9;
	const includedGbPerUser = 5;
	// Hetzner object storage at cost, including VAT and the card fee.
	const pricePerGb = 0.008;

	let users = $state(1);
	let storageGb = $state(1000);

	const includedGb = $derived(users * includedGbPerUser);
	const billableGb = $derived(Math.max(0, storageGb - includedGb));
	const seatCost = $derived(users * monthlySeatPrice);
	const storageCost = $derived(billableGb * pricePerGb);
	const monthlyTotal = $derived(seatCost + storageCost);
	const yearlyTotal = $derived(users * yearlySeatPrice + storageCost * 12);

	function euros(amount: number): string {
		return '€' + amount.toFixed(2);
	}

	function storageLabel(gigabytes: number): string {
		if (gigabytes < 1000) return gigabytes + ' GB';
		if (gigabytes % 1000 === 0) return gigabytes / 1000 + ' TB';
		return (gigabytes / 1000).toFixed(1) + ' TB';
	}

	const presets = [
		{ label: '100 GB', gigabytes: 100 },
		{ label: '500 GB', gigabytes: 500 },
		{ label: '1 TB', gigabytes: 1000 },
		{ label: '5 TB', gigabytes: 5000 }
	];
</script>

<div
	data-theme="light"
	class="relative mx-auto max-w-[680px] -rotate-[0.6deg] rounded-[3px] bg-surface p-7 shadow-[0_8px_24px_rgba(0,0,0,0.10)] max-md:p-5"
>
	<span
		aria-hidden="true"
		class="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 -rotate-2 bg-white/60 shadow-sm"
	></span>
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
					class="mt-3 w-full [accent-color:var(--brand)]"
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
					class="mt-3 w-full [accent-color:var(--brand)]"
				/>
				<div class="mt-3 flex flex-wrap gap-1.5">
					{#each presets as preset (preset.gigabytes)}
						<button
							type="button"
							onclick={() => (storageGb = preset.gigabytes)}
							class={[
								'rounded-full border px-2.5 py-1 font-mono text-[11px] transition-colors',
								{
									'border-line-strong bg-hover text-default': storageGb === preset.gigabytes,
									'border-line-faint text-dim hover:text-default': storageGb !== preset.gigabytes
								}
							]}
						>
							{preset.label}
						</button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Breakdown -->
		<div class="flex flex-col rounded-[3px] bg-paper p-5">
			<div class="flex flex-col gap-2 text-sm">
				<div class="flex items-center justify-between">
					<span class="text-muted">{users} × {euros(monthlySeatPrice)} seat</span>
					<span class="font-mono text-default">{euros(seatCost)}</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-muted">{includedGb} GB included</span>
					<span class="font-mono text-dim">€0.00</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-muted">{billableGb} GB × €0.008</span>
					<span class="font-mono text-default">{euros(storageCost)}</span>
				</div>
			</div>

			<div class="my-4 h-px bg-line-faint"></div>

			<div class="flex items-baseline justify-between">
				<span class="text-sm text-muted">Per month</span>
				<span class="text-3xl font-semibold tracking-tight text-default">{euros(monthlyTotal)}</span>
			</div>
			<p class="mt-1 text-right font-mono text-2xs text-faint">
				{euros(yearlyTotal)} a year with yearly seats
			</p>
		</div>
	</div>

	<p class="mt-6 border-t border-line-faint pt-5 text-center text-2xs text-dim">
		All prices include VAT. Storage is billed at what Hetzner charges us for it, never with a markup.
	</p>
</div>

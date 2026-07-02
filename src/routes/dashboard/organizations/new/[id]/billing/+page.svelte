<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { sdk } from '$lib/sdk';
	import { seatCost, FREE_SEATS, SEAT_PRICE_EUR } from '$lib/billing';
	import UsersIcon from 'phosphor-svelte/lib/UsersIcon';
	import HardDrivesIcon from 'phosphor-svelte/lib/HardDrivesIcon';
	import DatabaseIcon from 'phosphor-svelte/lib/DatabaseIcon';
	import CreditCardIcon from 'phosphor-svelte/lib/CreditCardIcon';
	import CaretDownIcon from 'phosphor-svelte/lib/CaretDownIcon';

	const orgId = $derived($page.params.id ?? '');

	let seatCount = $state(0);
	let loading = $state(true);

	let expanded = $state<Record<string, boolean>>({ seats: false, storage: false, database: false });

	// Mandate status as reported by the server: none | pending | valid | invalid.
	let paymentStatus = $state<string>('none');
	let paymentError = $state<string | null>(null);
	let settingUp = $state(false);

	// Projected seats = current members plus pending invites (each becomes a seat on accept).
	$effect(() => {
		const id = orgId;
		loading = true;
		Promise.all([sdk.organizations.members(id), sdk.organizations.invites(id)])
			.then(([members, invites]) => {
				if (orgId !== id) return;
				seatCount = members.length + invites.length;
				loading = false;
			})
			.catch(() => {
				loading = false;
			});
	});

	// Load current payment status, and refresh it when returning from Mollie checkout.
	$effect(() => {
		const id = orgId;
		sdk.organizations
			.billingStatus(id)
			.then((status) => {
				if (orgId === id) paymentStatus = status.status;
			})
			.catch(() => {});
	});

	const monthlySeatCost = $derived(seatCost(seatCount));
	const billableSeats = $derived(Math.max(0, seatCount - FREE_SEATS));
	const returningFromCheckout = $derived($page.url.searchParams.get('payment') === 'return');

	function toggle(key: string) {
		expanded[key] = !expanded[key];
	}

	async function addPaymentMethod() {
		settingUp = true;
		paymentError = null;
		try {
			const setup = await sdk.organizations.createPaymentSetup(orgId);
			// Hand off to Mollie's hosted checkout; Mollie redirects back here after.
			window.location.href = setup.checkout_url;
		} catch (e) {
			paymentError = (e as any)?.message ?? 'Could not start payment setup.';
			settingUp = false;
		}
	}

	function finish() {
		goto(`/dashboard/organizations/${orgId}/clients`);
	}
</script>

<svelte:head>
	<title>New organization · Billing — NeoWorks</title>
</svelte:head>

<div class="space-y-5">
	<div>
		<h2 class="text-[15px] font-semibold text-default">Billing</h2>
		<p class="text-[13px] text-dim mt-0.5">
			How this organization is billed. Expand each item for details. You can add a payment method
			now or later.
		</p>
	</div>

	<div class="space-y-2">
		<!-- Seats -->
		<div class="rounded-xl border border-line-faint bg-surface overflow-hidden">
			<button
				class="w-full flex items-start gap-3 p-4 text-left hover:bg-surface-hover transition-colors"
				onclick={() => toggle('seats')}
			>
				<div class="w-9 h-9 rounded-lg bg-raised flex items-center justify-center text-muted shrink-0">
					<UsersIcon size={18} />
				</div>
				<div class="min-w-0 flex-1">
					<div class="flex items-center justify-between gap-3">
						<p class="text-[13px] font-medium text-default">Seats</p>
						<div class="flex items-center gap-2 shrink-0">
							{#if loading}
								<span class="skeleton h-4 w-16 rounded"></span>
							{:else}
								<span class="text-[13px] font-medium text-default">€{monthlySeatCost}/mo</span>
							{/if}
							<CaretDownIcon
								size={14}
								class="text-dim transition-transform {expanded.seats ? 'rotate-180' : ''}"
							/>
						</div>
					</div>
					<p class="text-[12px] text-dim mt-0.5">
						First {FREE_SEATS} members free, then €{SEAT_PRICE_EUR}/seat/month.
					</p>
					{#if !loading}
						<p class="text-[12px] text-dim mt-1.5">
							{seatCount} seat{seatCount === 1 ? '' : 's'} (incl. pending invites)
							{#if billableSeats > 0}
								· {billableSeats} billable
							{:else}
								· within free allowance
							{/if}
						</p>
					{/if}
				</div>
			</button>
			{#if expanded.seats}
				<div class="px-4 pb-4 pl-16 text-[12px] text-muted leading-relaxed space-y-2">
					<p>
						Every member and pending invite counts as one seat. The first {FREE_SEATS} seats are
						free; each additional seat is €{SEAT_PRICE_EUR}/month, billed monthly to your billing
						email.
					</p>
					<p>
						Roles (owner, admin, member, billing) don't change the price — every person counts as a
						single seat. Removing a member frees their seat from the next billing cycle. Pending
						invites are counted so the estimate reflects your team once everyone accepts.
					</p>
				</div>
			{/if}
		</div>

		<!-- Storage -->
		<div class="rounded-xl border border-line-faint bg-surface overflow-hidden">
			<button
				class="w-full flex items-start gap-3 p-4 text-left hover:bg-surface-hover transition-colors"
				onclick={() => toggle('storage')}
			>
				<div class="w-9 h-9 rounded-lg bg-raised flex items-center justify-center text-muted shrink-0">
					<HardDrivesIcon size={18} />
				</div>
				<div class="min-w-0 flex-1">
					<div class="flex items-center justify-between gap-3">
						<p class="text-[13px] font-medium text-default">Storage</p>
						<div class="flex items-center gap-2 shrink-0">
							<span class="text-[12px] text-dim">Usage-based</span>
							<CaretDownIcon
								size={14}
								class="text-dim transition-transform {expanded.storage ? 'rotate-180' : ''}"
							/>
						</div>
					</div>
					<p class="text-[12px] text-dim mt-0.5">Billed at cost, metered monthly.</p>
				</div>
			</button>
			{#if expanded.storage}
				<div class="px-4 pb-4 pl-16 text-[12px] text-muted leading-relaxed space-y-2">
					<p>
						Objects your organization uploads through the API are billed at the same rate our cloud
						provider charges us — no markup. You only pay for what's actually stored, prorated by how
						long it's stored.
					</p>
					<p>
						Each object's visibility (public or private) is chosen per-upload via the API and has no
						effect on price. Usage is metered continuously and totalled at the end of each month.
					</p>
				</div>
			{/if}
		</div>

		<!-- Database usage -->
		<div class="rounded-xl border border-line-faint bg-surface overflow-hidden">
			<button
				class="w-full flex items-start gap-3 p-4 text-left hover:bg-surface-hover transition-colors"
				onclick={() => toggle('database')}
			>
				<div class="w-9 h-9 rounded-lg bg-raised flex items-center justify-center text-muted shrink-0">
					<DatabaseIcon size={18} />
				</div>
				<div class="min-w-0 flex-1">
					<div class="flex items-center justify-between gap-3">
						<p class="text-[13px] font-medium text-default">Database usage</p>
						<div class="flex items-center gap-2 shrink-0">
							<span class="text-[12px] text-dim">Usage-based</span>
							<CaretDownIcon
								size={14}
								class="text-dim transition-transform {expanded.database ? 'rotate-180' : ''}"
							/>
						</div>
					</div>
					<p class="text-[12px] text-dim mt-0.5">Metered monthly on query time and throughput.</p>
				</div>
			</button>
			{#if expanded.database}
				<div class="px-4 pb-4 pl-16 text-[12px] text-muted leading-relaxed space-y-2">
					<p>
						Client databases owned by the organization are metered on three axes: query time (seconds
						spent executing queries), throughput (data read and written on shared infrastructure), and
						the storage amount and speed of the underlying volume.
					</p>
					<p>
						These are small line items on shared architecture today. Dedicated servers and regions
						with fixed pricing are coming, and you'll be able to choose where each database is
						deployed.
					</p>
				</div>
			{/if}
		</div>
	</div>

	<!-- Payment method -->
	<div class="rounded-xl border border-line-faint bg-surface p-4 space-y-3">
		<div class="flex items-start gap-3">
			<div class="w-9 h-9 rounded-lg bg-raised flex items-center justify-center text-muted shrink-0">
				<CreditCardIcon size={18} />
			</div>
			<div class="min-w-0 flex-1">
				<p class="text-[13px] font-medium text-default">Payment method</p>
				<p class="text-[12px] text-dim mt-0.5">
					Add a card or direct debit to activate usage-based billing.
				</p>
			</div>
		</div>
		<button
			class="h-9 px-4 rounded-lg border border-line text-[13px] text-muted hover:text-default hover:border-line-strong transition-colors disabled:opacity-50"
			onclick={addPaymentMethod}
			disabled={settingUp || paymentStatus === 'valid'}
		>
			{#if paymentStatus === 'valid'}
				Payment method added
			{:else if settingUp}
				Redirecting…
			{:else if paymentStatus === 'pending'}
				Retry payment setup
			{:else}
				Add payment method
			{/if}
		</button>
		{#if paymentStatus === 'valid'}
			<p class="text-[12px] text-green">A payment method is active for this organization.</p>
		{:else if paymentStatus === 'pending' && returningFromCheckout}
			<p class="text-[12px] text-dim">
				Payment is being confirmed. This can take a moment — you can finish and it'll activate
				once Mollie confirms.
			</p>
		{:else if paymentStatus === 'invalid'}
			<p class="text-[12px] text-amber">The last payment didn't go through. Try again.</p>
		{/if}
		{#if paymentError}
			<p class="text-[12px] text-red">{paymentError}</p>
		{/if}
	</div>

	<div class="flex items-center justify-between gap-3 pt-2 border-t border-line-faint">
		<button
			class="h-9 px-4 rounded-lg text-[13px] text-muted hover:text-default transition-colors"
			onclick={finish}
		>Set up later</button>
		<button
			class="h-9 px-4 rounded-lg bg-primary text-primary-content text-[13px] font-medium hover:opacity-90 transition-opacity"
			onclick={finish}
		>Finish</button>
	</div>
</div>

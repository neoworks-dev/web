<script lang="ts">
	import { resolve } from '$app/paths';
	import CheckIcon from 'phosphor-svelte/lib/CheckIcon';
	import PaperCard from './scrapbook/PaperCard.svelte';

	type BillingPeriod = 'monthly' | 'yearly';

	type Tier = {
		name: string;
		price: string;
		unit: string;
		features: string[];
		featured: boolean;
		cta: string;
		href: string;
	};

	const billingPeriods: { value: BillingPeriod; label: string }[] = [
		{ value: 'monthly', label: 'Monthly' },
		{ value: 'yearly', label: 'Yearly' }
	];

	const freeTier: Tier = {
		name: 'Free',
		price: '€0',
		unit: 'forever',
		features: ['1 GB encrypted storage', 'Every Neoworks app, on all your devices', 'No card required'],
		featured: false,
		cta: 'Start free',
		href: resolve('/auth/signup')
	};

	const selfHostedTier: Tier = {
		name: 'Self-hosted',
		price: 'Free',
		unit: 'on your own server',
		features: ['Run the full stack yourself', 'Unlimited storage on your hardware', 'Zero NeoWorks fees'],
		featured: false,
		cta: 'Read the guide',
		href: '/docs/neoworks/self-host'
	};

	const plans = [
		{ name: 'Daypack', storage: '200 GB', monthlyPrice: '€4.99', yearlyPrice: '€49.90' },
		{ name: 'Backpack', storage: '500 GB', monthlyPrice: '€9.99', yearlyPrice: '€99.90' },
		{ name: 'Expedition', storage: '1.5 TB', monthlyPrice: '€19.99', yearlyPrice: '€199.90' }
	];

	const planRotations = [0.6, -0.8, 1.1];

	let billingPeriod: BillingPeriod = $state('monthly');

	function payAsYouGoTier(): Tier {
		let price = '€2.99';
		let unit = 'per user / month';
		if (billingPeriod === 'yearly') {
			price = '€29.90';
			unit = 'per user / year';
		}

		return {
			name: 'Pay as you go',
			price,
			unit,
			features: [
				'5 GB encrypted storage included per user',
				'Beyond that €0.008 per GB, exactly what it costs us',
				'Every Neoworks app, on all your devices',
				'The cheapest way for almost everyone'
			],
			featured: true,
			cta: 'Get started',
			href: resolve('/auth/signup')
		};
	}

	function planTier(plan: (typeof plans)[number]): Tier {
		let price = plan.monthlyPrice;
		let unit = 'per month';
		if (billingPeriod === 'yearly') {
			price = plan.yearlyPrice;
			unit = 'per year';
		}

		return {
			name: plan.name,
			price,
			unit,
			features: [
				`${plan.storage} encrypted storage`,
				'Every Neoworks app, on all your devices',
				'The same bill every month, whatever you store',
				'Priority support'
			],
			featured: false,
			cta: `Choose ${plan.name}`,
			href: resolve('/auth/signup')
		};
	}
</script>

{#snippet tierCard(tier: Tier, rotate: number, revealDelay: number)}
	<PaperCard {rotate} {revealDelay} class="flex flex-col p-7">
		{#if tier.featured}
			<span
				class="absolute -right-3 -top-4 rotate-6 rounded-[3px] border-2 border-ink bg-note px-2.5 py-0.5 font-hand text-xl text-ink shadow-sm"
			>
				Recommended
			</span>
		{/if}

		<span class="text-sm font-semibold tracking-tight text-default">{tier.name}</span>

		<div class="mt-4 flex flex-wrap items-baseline gap-x-1.5">
			<span class="text-4xl font-semibold tracking-tight text-default">{tier.price}</span>
			<span class="font-hand text-lg text-dim">{tier.unit}</span>
		</div>

		<ul class="mt-6 flex flex-1 flex-col gap-3">
			{#each tier.features as feature (feature)}
				<li class="flex items-start gap-2.5 text-sm text-muted">
					<CheckIcon size={16} weight="bold" class="mt-0.5 shrink-0 text-brand" />
					{feature}
				</li>
			{/each}
		</ul>

		{#if tier.featured}
			<a
				href={tier.href}
				class="mt-7 rounded-md bg-brand px-4 py-2.5 text-center text-sm font-semibold text-brand-fg transition-colors hover:bg-brand-hover"
			>
				{tier.cta}
			</a>
		{:else}
			<a
				href={tier.href}
				class="mt-7 rounded-md border border-line px-4 py-2.5 text-center text-sm font-semibold text-muted transition-colors hover:bg-hover hover:text-default"
			>
				{tier.cta}
			</a>
		{/if}
	</PaperCard>
{/snippet}

<div class="flex justify-center">
	<div
		data-theme="light"
		role="group"
		aria-label="Billing period"
		class="flex gap-1 rounded-full border-2 border-ink bg-surface p-1 shadow-sm"
	>
		{#each billingPeriods as period (period.value)}
			<button
				type="button"
				aria-pressed={billingPeriod === period.value}
				onclick={() => (billingPeriod = period.value)}
				class={[
					'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
					{
						'bg-brand text-brand-fg': billingPeriod === period.value,
						'text-muted hover:text-default': billingPeriod !== period.value
					}
				]}
			>
				{period.label}
			</button>
		{/each}
	</div>
</div>

<div class="mt-10 grid grid-cols-3 items-stretch gap-6 max-md:grid-cols-1">
	{@render tierCard(freeTier, -1, 0)}
	{@render tierCard(payAsYouGoTier(), 0.6, 100)}
	{@render tierCard(selfHostedTier, 1.1, 200)}
</div>

<p class="mt-16 text-center font-hand text-2xl text-default">Prefer one fixed price?</p>

<div class="mt-6 grid grid-cols-3 items-stretch gap-6 max-md:grid-cols-1">
	{#each plans as plan, index (plan.name)}
		{@render tierCard(planTier(plan), planRotations[index], 300 + index * 100)}
	{/each}
</div>

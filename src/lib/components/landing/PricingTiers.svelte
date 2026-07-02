<script lang="ts">
	import { resolve } from '$app/paths';
	import CheckIcon from 'phosphor-svelte/lib/CheckIcon';

	const tiers = [
		{
			name: 'Free',
			price: '€0',
			unit: 'forever',
			featured: false,
			features: [
				'1 GB encrypted object storage',
				'Your identity across every app',
				'Access to all ecosystem apps',
				'Community support'
			],
			cta: 'Start free',
			href: resolve('/auth/signup')
		},
		{
			name: 'Pro',
			price: '€2',
			unit: 'per user / month',
			featured: true,
			features: [
				'Everything in Free',
				'5 GB storage included',
				'Extra usage billed at cost — no markup',
				'Priority support'
			],
			cta: 'Get started',
			href: resolve('/auth/signup')
		},
		{
			name: 'Self-hosted',
			price: 'Free',
			unit: 'open source · MIT',
			featured: false,
			features: [
				'Run the full stack yourself',
				'Unlimited storage on your hardware',
				'Zero NeoWorks fees',
				'Community support'
			],
			cta: 'Read the guide',
			href: '/docs/neoworks/self-host'
		}
	];
</script>

<div class="grid grid-cols-3 gap-4 max-md:grid-cols-1">
	{#each tiers as tier}
		<div
			class="flex flex-col rounded-2xl border p-7 {tier.featured
				? 'border-line-strong bg-elevated'
				: 'border-line-faint bg-elevated/50'}"
		>
			<div class="flex items-center justify-between">
				<span class="text-sm font-semibold tracking-tight text-default">{tier.name}</span>
				{#if tier.featured}
					<span
						class="rounded-full border border-line-faint bg-raised px-2 py-0.5 font-mono text-2xs uppercase tracking-[0.1em] text-dim"
					>
						Popular
					</span>
				{/if}
			</div>

			<div class="mt-4 flex items-baseline gap-1.5">
				<span class="text-3xl font-semibold tracking-tight text-default">{tier.price}</span>
				<span class="text-xs text-dim">{tier.unit}</span>
			</div>

			<ul class="mt-6 flex flex-1 flex-col gap-3">
				{#each tier.features as feature}
					<li class="flex items-start gap-2.5 text-sm text-muted">
						<CheckIcon size={16} weight="bold" class="mt-0.5 shrink-0 text-primary" />
						{feature}
					</li>
				{/each}
			</ul>

			<a
				href={tier.href}
				class="mt-7 rounded-full px-4 py-2.5 text-center text-sm font-semibold transition-colors {tier.featured
					? 'bg-primary text-inverse hover:opacity-90'
					: 'border border-line text-muted hover:bg-hover hover:text-default'}"
			>
				{tier.cta}
			</a>
		</div>
	{/each}
</div>

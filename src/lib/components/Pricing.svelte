<script lang="ts">
	const tiers = [
		{
			name:     'Starter',
			sub:      'For individuals',
			price:    'Free',
			accent:   'grove',
			featured: false,
			href:     '/signup',
			cta:      'Get started free',
			features: [
				'All neoworks apps included',
				'200 MB storage',
				'Community support',
			],
		},
		{
			name:     'Pro',
			sub:      'For professionals',
			price:    '€2',
			accent:   'tide',
			featured: true,
			href:     '/signup?plan=pro',
			cta:      'Start Pro trial',
			features: [
				'5 GB storage included',
				'Relay links up to 30 days',
				'Extra storage at €0.02/GB',
				'Priority support',
			],
		},
		{
			name:     'Business',
			sub:      'For teams',
			price:    '€12',
			accent:   'vine',
			featured: false,
			href:     '/signup?plan=business',
			cta:      'Talk to sales',
			features: [
				'Everything in Pro',
				'Redundant storage with 99.9% uptime SLA',
				'Optional storage replication across regions',
				'Admin & audit logs',
				'Dedicated support',
			],
		},
	];
</script>

<section id="pricing" class="border-t border-border-base px-8 py-24 max-md:px-5 max-md:py-16">
	<div class="mx-auto max-w-[1120px]">

		<!-- Header -->
		<span class="font-mono text-xs font-semibold uppercase tracking-[0.07em] text-text-muted">
			Pricing
		</span>
		<h2 class="mb-3 mt-3 font-display text-[clamp(22px,2.8vw,32px)] font-extrabold text-text-primary">
			Less than a coffee. No catch.
		</h2>
		<p class="mb-14 max-w-[400px] font-body text-base font-light leading-relaxed text-text-secondary">
			Free gets you everything to get started. Pro removes every limit.
			Self-hosted is free and always will be.
		</p>

		<!-- Tier cards -->
		<div class="grid grid-cols-1 gap-5 md:grid-cols-3">
			{#each tiers as tier}
				<div class="flex flex-col rounded-xl border p-7 transition-shadow duration-150
					{tier.featured
						? 'border-tide-border bg-tide-subtle shadow-raised'
						: 'border-border-base bg-bg-surface hover:shadow-base'
					}">

					<!-- Name + badge -->
					<div class="mb-5 flex items-start justify-between">
						<div>
							<div class="mb-1 font-display text-lg font-bold text-text-primary">
								{tier.name}
							</div>
							<div class="font-mono text-[9px] uppercase tracking-[0.1em] text-text-muted">
								{tier.sub}
							</div>
						</div>
						{#if tier.featured}
							<span class="rounded-full border border-tide-border bg-tide-subtle px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-tide-fg">
								Best value
							</span>
						{/if}
					</div>

					<!-- Price -->
					<div class="mb-6 font-display text-[clamp(32px,4vw,44px)] font-extrabold tracking-tight text-{tier.accent}-fg">
						{tier.price}
						{#if tier.price !== 'Free'}
							<span class="font-body text-base font-light text-text-secondary">{tier.name === "Business" ? "/seat" : ""}/mo</span>
						{/if}
					</div>

					<!-- Features -->
					<ul class="mb-8 flex flex-grow flex-col gap-2.5">
						{#each tier.features as feat}
							<li class="flex items-start gap-2.5">
								<span class="mt-[5px] size-[5px] shrink-0 rounded-full bg-{tier.accent}-accent"></span>
								<span class="font-body text-sm font-light text-text-secondary">{feat}</span>
							</li>
						{/each}
					</ul>

					<!-- CTA -->
					<a
						href={tier.href}
						class="block w-full rounded-full py-2.5 text-center font-body text-sm font-medium transition-opacity duration-150 hover:opacity-85
							{tier.featured
								? 'bg-tide-accent text-text-inverted'
								: 'border border-border-strong bg-transparent text-text-primary hover:bg-bg-subtle'
							}"
					>
						{tier.cta}
					</a>

				</div>
			{/each}
		</div>

		<!-- Footnote -->
		<p class="mt-5 font-mono text-[10px] tracking-[0.06em] text-text-muted">
			Extra storage at cost: €0.02/GB objects · €0.10/GB database. No markup.
		</p>

	</div>
</section>
<script lang="ts">
	import SectionHeading from '../landing/SectionHeading.svelte';
	import UserIcon from 'phosphor-svelte/lib/UserIcon';
	import LeafIcon from 'phosphor-svelte/lib/LeafIcon';
	import UsersThreeIcon from 'phosphor-svelte/lib/UsersThreeIcon';
	import AppWindowIcon from 'phosphor-svelte/lib/AppWindowIcon';

	const flow = [
		{ Icon: UserIcon, label: 'Pro user', value: '€2', note: '/ month' },
		{ Icon: LeafIcon, label: 'NeoWorks', value: '€0.50', note: 'platform cut' },
		{ Icon: UsersThreeIcon, label: 'Developer pool', value: '€1.50', note: 'split equally' }
	];
</script>

<section class="border-t border-line-faint px-6 py-24 max-md:py-16">
	<div class="mx-auto max-w-[1120px]">
		<SectionHeading
			eyebrow="Revenue model"
			title="Get paid for building good software."
			subtitle="Every €2/mo Pro subscriber splits €1.50 equally among the third-party apps they actively used that month. The more genuinely useful your app is, the more you earn — not the more addictive it is."
		/>

		<div class="mt-12 rounded-2xl border border-line-faint bg-elevated/50 p-8 max-md:p-6">
			<div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-6 text-center">
				{#each flow as { Icon, label, value, note }, i}
					<div class="flex flex-col items-center gap-2">
						<span
							class="flex size-12 items-center justify-center rounded-xl border border-line-faint bg-raised text-muted"
						>
							<Icon size={22} weight="duotone" />
						</span>
						<span class="font-mono text-[10px] uppercase tracking-[0.1em] text-dim">{label}</span>
						<span class="text-xl font-semibold tracking-tight text-default">{value}</span>
						<span class="font-mono text-[10px] text-dim">{note}</span>
					</div>
					{#if i < flow.length - 1}
						<span class="font-mono text-lg text-faint">→</span>
					{/if}
				{/each}

				<span class="font-mono text-lg text-faint">÷</span>

				<div
					class="flex flex-col items-center gap-2 rounded-xl border border-line bg-raised px-5 py-3"
				>
					<span
						class="flex size-12 items-center justify-center rounded-xl border border-line-faint bg-elevated text-primary"
					>
						<AppWindowIcon size={22} weight="duotone" />
					</span>
					<span class="font-mono text-[10px] uppercase tracking-[0.1em] text-primary">Your app</span>
					<span class="text-xl font-semibold tracking-tight text-default">€1.50 / n</span>
					<span class="font-mono text-[10px] text-dim">where n = active apps</span>
				</div>
			</div>

			<p class="mt-6 text-center font-mono text-[10px] tracking-[0.06em] text-faint">
				First-party NeoWorks apps don’t participate in the split — no conflict of interest.
			</p>
		</div>
	</div>
</section>

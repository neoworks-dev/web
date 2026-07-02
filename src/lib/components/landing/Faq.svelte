<script lang="ts">
	import SectionHeading from './SectionHeading.svelte';
	import PlusIcon from 'phosphor-svelte/lib/PlusIcon';
	import MinusIcon from 'phosphor-svelte/lib/MinusIcon';

	const faqs = [
		{
			q: 'Is my data really encrypted?',
			a: 'Yes. Your data is encrypted with keys derived on your own devices before it ever reaches our servers. We store ciphertext we cannot read — not your files, contacts, or notes.'
		},
		{
			q: 'What happens if NeoWorks shuts down?',
			a: 'You are never locked in. You can export a full, decrypted copy of your data at any time, and the entire stack is open source and self-hostable — so you can keep running it on your own server.'
		},
		{
			q: 'How can it be this cheap?',
			a: 'Because we don’t sell ads or data, and we don’t mark up infrastructure. You pay a small flat fee per user plus the storage and compute you actually use, at the price it costs us.'
		},
		{
			q: 'What is included for free?',
			a: 'The free tier gives you your identity and 1 GB of encrypted object storage across every app in the ecosystem — no credit card required.'
		},
		{
			q: 'Can other apps see my data?',
			a: 'Only the data you grant them, through scoped permissions you control. Every grant is visible in one place and can be revoked instantly, which cuts off that app’s access to your encrypted data.'
		},
		{
			q: 'Can I build my own app on it?',
			a: 'Absolutely — that’s the point. Register an OAuth client, define your schema, and get scoped, row-isolated storage that lives in each user’s own encrypted account. See the developer docs to start.'
		}
	];

	let openIndex = $state<number | null>(0);

	function toggle(index: number) {
		openIndex = openIndex === index ? null : index;
	}
</script>

<section class="border-t border-line-faint px-6 py-24 max-md:py-16">
	<div class="mx-auto max-w-[760px]">
		<SectionHeading eyebrow="FAQ" title="Questions, answered." align="center" />

		<div class="mt-12 flex flex-col gap-2">
			{#each faqs as { q, a }, index}
				{@const isOpen = openIndex === index}
				<div class="overflow-hidden rounded-2xl border border-line-faint bg-elevated/50">
					<button
						type="button"
						aria-expanded={isOpen}
						onclick={() => toggle(index)}
						class="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-hover"
					>
						<span class="flex-1 text-[15px] font-medium text-default">{q}</span>
						<span class="flex size-6 shrink-0 items-center justify-center text-dim">
							{#if isOpen}
								<MinusIcon size={16} />
							{:else}
								<PlusIcon size={16} />
							{/if}
						</span>
					</button>
					{#if isOpen}
						<p class="px-5 pb-5 text-sm leading-relaxed text-muted">{a}</p>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</section>

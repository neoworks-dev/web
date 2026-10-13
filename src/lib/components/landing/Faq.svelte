<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import SectionHeading from './SectionHeading.svelte';
	import Marmot from './scrapbook/Marmot.svelte';
	import HillEdge from './scrapbook/HillEdge.svelte';
	import PlusIcon from 'phosphor-svelte/lib/PlusIcon';
	import MinusIcon from 'phosphor-svelte/lib/MinusIcon';

	type Question = { q: string; a: string };

	const landingQuestions: Question[] = [
		{
			q: 'Can I bring my existing photos and files?',
			a: 'Yes. Connect the account they live in today, like Google, and your library comes across with its albums and dates. Each photo is encrypted on your device before it is uploaded to Neoworks.'
		},
		{
			q: 'Is my data really encrypted?',
			a: 'Yes. Your data is encrypted with keys derived on your own devices before it ever reaches our servers. We store ciphertext we cannot read, whether that is a photo, a file or a contact.'
		},
		{
			q: 'Do I need a new email address?',
			a: 'No. Neoworks Mail is an app for the address you already have. Your mail stays with your current provider.'
		},
		{
			q: 'What happens if NeoWorks shuts down?',
			a: 'You are never locked in. You can export a full, decrypted copy of your data at any time, and the entire stack is source available and self-hostable — so you can keep running it on your own server.'
		},
		{
			q: 'How can it be this cheap?',
			a: 'Because we don’t sell ads or data. On pay as you go you pay €2.99 a month plus storage at the price it costs us, so 200 GB comes to €4.55.'
		},
		{
			q: 'What is included for free?',
			a: 'The free tier gives you your account and 1 GB of encrypted storage across every Neoworks app, with no credit card required.'
		}
	];

	let {
		questions = landingQuestions,
		title = 'Questions, answered.'
	}: { questions?: Question[]; title?: string } = $props();

	let openIndex = $state<number | null>(0);

	function toggle(index: number) {
		if (openIndex === index) {
			openIndex = null;
			return;
		}
		openIndex = index;
	}
</script>

<!-- Back onto the meadow before the mountains. -->
<section class="relative bg-meadow px-6 pb-24 pt-20 max-md:py-16">
	<HillEdge />
	<div class="mx-auto max-w-[760px]">
		<Marmot pose="sleeping" class="mx-auto mb-4 w-[200px]" />
		<SectionHeading eyebrow="Still wondering?" {title} align="center" />

		<div class="mt-12 flex flex-col gap-2">
			{#each questions as { q, a }, index}
				{@const isOpen = openIndex === index}
				<div
					use:reveal={{ delay: index * 60 }}
					class="overflow-hidden rounded-[3px] bg-surface shadow-[0_4px_14px_rgba(0,0,0,0.08)]"
				>
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

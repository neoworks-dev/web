<script lang="ts">
	import SectionHeading from './SectionHeading.svelte';
	import LockKeyIcon from 'phosphor-svelte/lib/LockKeyIcon';
	import FingerprintIcon from 'phosphor-svelte/lib/FingerprintIcon';
	import ReceiptIcon from 'phosphor-svelte/lib/ReceiptIcon';
	import PuzzlePieceIcon from 'phosphor-svelte/lib/PuzzlePieceIcon';

	const pillars = [
		{
			title: 'End-to-end encrypted',
			body: 'Your data is encrypted with keys derived on your device. NeoWorks stores ciphertext it cannot read — not your files, not your contacts, nothing.',
			Icon: LockKeyIcon
		},
		{
			title: 'One identity, everywhere',
			body: 'A single OAuth login works across every app. No new account per service, no scattered profiles, no re-entering the same data over and over.',
			Icon: FingerprintIcon
		},
		{
			title: 'True pass-through pricing',
			body: 'A flat €2 per user each month, plus the storage and compute you actually use — at cost. No markup, no ads, no surveillance subsidising a "free" plan.',
			Icon: ReceiptIcon
		},
		{
			title: 'An open ecosystem',
			body: 'Any developer can build on the same encrypted layer. The apps you see today are just the start — the platform is open and self-hostable.',
			Icon: PuzzlePieceIcon
		}
	];
</script>

<section class="border-t border-line-faint px-6 py-24 max-md:py-16">
	<div class="mx-auto max-w-[1120px]">
		<SectionHeading
			eyebrow="Why NeoWorks"
			title="Built so the data is actually yours."
			subtitle="Most apps own your data and rent it back to you. NeoWorks inverts that — you own the account, the keys, and the data; apps are just guests."
		/>

		<div class="mt-12 grid grid-cols-2 gap-4 max-md:grid-cols-1">
			{#each pillars as { title, body, Icon }}
				<div class="flex gap-4 rounded-2xl border border-line-faint bg-elevated/50 p-6">
					<span
						class="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line-faint bg-raised text-muted"
					>
						<Icon size={22} weight="duotone" />
					</span>
					<div>
						<h3 class="text-base font-semibold tracking-tight text-default">{title}</h3>
						<p class="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

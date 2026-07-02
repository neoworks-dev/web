<script lang="ts">
	import SectionHeading from './SectionHeading.svelte';
	import UserCirclePlusIcon from 'phosphor-svelte/lib/UserCirclePlusIcon';
	import SquaresFourIcon from 'phosphor-svelte/lib/SquaresFourIcon';
	import KeyIcon from 'phosphor-svelte/lib/KeyIcon';

	const steps = [
		{
			n: '01',
			title: 'Create your account',
			body: 'Sign up once. This becomes your encrypted home for everything — your identity and your data in one place that belongs to you.',
			Icon: UserCirclePlusIcon
		},
		{
			n: '02',
			title: 'Use any app in the ecosystem',
			body: 'Apps ask for permission, then read and write to your encrypted space. Your data follows you between apps instead of being trapped inside each one.',
			Icon: SquaresFourIcon
		},
		{
			n: '03',
			title: 'Hold the keys, stay in control',
			body: 'Everything is encrypted with keys only you hold. Revoke any app anytime, export all your data, or self-host the whole thing.',
			Icon: KeyIcon
		}
	];
</script>

<section class="border-t border-line-faint px-6 py-24 max-md:py-16">
	<div class="mx-auto max-w-[1120px]">
		<SectionHeading
			eyebrow="How it works"
			title="One account. Every app. Full control."
			subtitle="No new login for every service, no data scattered across a dozen companies. One encrypted account that every app plugs into."
		/>

		<div class="mt-12 grid grid-cols-3 gap-4 max-md:grid-cols-1">
			{#each steps as { n, title, body, Icon }}
				<div class="rounded-2xl border border-line-faint bg-elevated/50 p-6">
					<div class="flex items-center justify-between">
						<span
							class="flex size-10 items-center justify-center rounded-xl border border-line-faint bg-raised text-muted"
						>
							<Icon size={20} weight="duotone" />
						</span>
						<span class="font-mono text-xs text-faint">{n}</span>
					</div>
					<h3 class="mt-5 text-base font-semibold tracking-tight text-default">{title}</h3>
					<p class="mt-2 text-sm leading-relaxed text-muted">{body}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

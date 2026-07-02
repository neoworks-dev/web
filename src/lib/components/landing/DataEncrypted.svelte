<script lang="ts">
	import KeyIcon from 'phosphor-svelte/lib/KeyIcon';
	import ShieldCheckIcon from 'phosphor-svelte/lib/ShieldCheckIcon';
	import HardDrivesIcon from 'phosphor-svelte/lib/HardDrivesIcon';
	import EyeSlashIcon from 'phosphor-svelte/lib/EyeSlashIcon';

	const guarantees = [
		{
			title: 'Keys derived on your device',
			body: 'Your encryption keys come from your credentials and never leave your devices in usable form. NeoWorks stores keys it cannot use.',
			Icon: KeyIcon
		},
		{
			title: 'We store ciphertext, not content',
			body: 'Files, contacts, notes — everything lands in our storage already encrypted. A breach or a subpoena yields scrambled bytes.',
			Icon: ShieldCheckIcon
		},
		{
			title: 'Run it yourself',
			body: 'Do not want to trust us at all? The whole stack is open source and self-hostable. Same apps, your hardware.',
			Icon: HardDrivesIcon
		}
	];
</script>

<section class="border-t border-line-faint px-6 py-24 max-md:py-16">
	<div class="mx-auto grid max-w-[1120px] grid-cols-2 items-center gap-12 max-lg:grid-cols-1">
		<!-- Copy -->
		<div>
			<span class="font-mono text-[11px] uppercase tracking-[0.14em] text-dim">Your data, encrypted</span>
			<h2
				class="mt-3 text-[clamp(28px,3.5vw,40px)] font-semibold leading-[1.05] tracking-tight text-default"
			>
				Encrypted so thoroughly that even we can’t read it.
			</h2>
			<p class="mt-4 max-w-[460px] text-[15px] leading-relaxed text-muted">
				NeoWorks is built end-to-end encrypted from the ground up. Privacy isn’t a setting you
				switch on — it’s the only way the system works.
			</p>

			<ul class="mt-8 flex flex-col gap-5">
				{#each guarantees as { title, body, Icon }}
					<li class="flex gap-4">
						<span
							class="flex size-10 shrink-0 items-center justify-center rounded-xl border border-line-faint bg-raised text-muted"
						>
							<Icon size={20} weight="duotone" />
						</span>
						<div>
							<h3 class="text-sm font-semibold tracking-tight text-default">{title}</h3>
							<p class="mt-1 text-sm leading-relaxed text-muted">{body}</p>
						</div>
					</li>
				{/each}
			</ul>
		</div>

		<!-- "What we can see" card -->
		<div class="rounded-3xl border border-line bg-elevated/60 p-8">
			<div class="flex items-center gap-2.5 text-dim">
				<EyeSlashIcon size={18} weight="duotone" />
				<span class="font-mono text-[11px] uppercase tracking-[0.12em]">What NeoWorks sees</span>
			</div>

			<div class="mt-6 flex flex-col gap-2">
				{#each ['a3f9c1b7e2…', '7d2e8f04aa…', 'c91b3e5d60…', 'f08a2c7b14…'] as blob}
					<div
						class="flex items-center gap-3 rounded-lg border border-line-faint bg-surface px-3 py-2.5"
					>
						<span class="size-2 shrink-0 rounded-full bg-line-strong"></span>
						<span class="truncate font-mono text-xs text-faint">{blob}</span>
						<span class="ml-auto font-mono text-2xs text-dim">encrypted</span>
					</div>
				{/each}
			</div>

			<p class="mt-6 text-sm leading-relaxed text-muted">
				That’s the whole picture on our side — opaque, encrypted blobs. The keys that turn them
				back into your life stay with you.
			</p>
		</div>
	</div>
</section>

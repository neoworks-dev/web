<script lang="ts">
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import GithubLogoIcon from 'phosphor-svelte/lib/GithubLogoIcon';
	import CloudArrowUpIcon from 'phosphor-svelte/lib/CloudArrowUpIcon';
	import HardDrivesIcon from 'phosphor-svelte/lib/HardDrivesIcon';
	import DownloadButton from './DownloadButton.svelte';
	import { latent } from '$lib/latent';
	import { siteUrl } from '$lib/urls';
</script>

<section class="border-t border-line-faint px-6 py-24 max-md:py-16">
	<div class="mx-auto max-w-[1120px]">
		<div class="grid gap-4 md:grid-cols-2">
			<div class="flex gap-4 rounded-2xl border border-line-faint bg-elevated/50 p-6">
				<span
					class="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line-faint bg-raised text-muted"
				>
					<GithubLogoIcon size={22} weight="duotone" />
				</span>
				<div>
					<h3 class="text-base font-semibold tracking-tight text-default">Free and open source</h3>
					<p class="mt-1.5 text-sm leading-relaxed text-muted">
						No licence, no subscription, no account. Read the code, build it yourself, or fork
						it — the editor is yours either way.
					</p>
					<a
						href={latent.sourceUrl}
						class="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-default transition-opacity hover:opacity-70"
					>
						Read the source
						<ArrowRightIcon size={13} weight="bold" />
					</a>
				</div>
			</div>

			<div class="flex gap-4 rounded-2xl border border-line-faint bg-elevated/50 p-6">
				<span
					class="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line-faint bg-raised text-muted"
				>
					<CloudArrowUpIcon size={22} weight="duotone" />
				</span>
				<div>
					<h3 class="text-base font-semibold tracking-tight text-default">
						Somewhere to put the finished work
					</h3>
					<p class="mt-1.5 text-sm leading-relaxed text-muted">
						Latent edits locally and stops there. A NeoWorks plan gives the results encrypted
						storage and sync across your devices — at cost, never scanned, never sold.
					</p>
					<a
						href={siteUrl}
						class="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-default transition-opacity hover:opacity-70"
					>
						See NeoWorks photo storage
						<ArrowRightIcon size={13} weight="bold" />
					</a>
				</div>
			</div>
		</div>

		<div
			class="mt-14 flex flex-col items-center gap-5 rounded-2xl border border-line-faint bg-elevated/50 px-6 py-14 text-center"
		>
			<h2
				class="max-w-[520px] text-[clamp(26px,3.2vw,38px)] leading-[1.08] font-semibold tracking-tight text-default"
			>
				Open a RAW file and see what it was hiding.
			</h2>
			<DownloadButton size="lg" />
			<p class="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.14em] text-dim uppercase">
				<HardDrivesIcon size={13} weight="bold" />
				Linux x86_64 · No install · macOS later
			</p>
		</div>
	</div>
</section>

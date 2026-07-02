<script lang="ts">
	import SectionHeading from './SectionHeading.svelte';
	import ProhibitIcon from 'phosphor-svelte/lib/ProhibitIcon';
	import DownloadSimpleIcon from 'phosphor-svelte/lib/DownloadSimpleIcon';
	import GithubLogoIcon from 'phosphor-svelte/lib/GithubLogoIcon';

	const controls = [
		{
			title: 'Revoke any app, instantly',
			body: 'Every app holds a scoped grant you can see and cut off from one place. Pull access and it loses its keys to your data on the spot.',
			Icon: ProhibitIcon
		},
		{
			title: 'Export everything, anytime',
			body: 'Your data is yours to take. Download a full, decrypted copy whenever you like — no tickets, no waiting, no “contact support”.',
			Icon: DownloadSimpleIcon
		},
		{
			title: 'No lock-in, by design',
			body: 'Open source and self-hostable. If NeoWorks ever disappoints you — or just disappears — you can move your account to your own server.',
			Icon: GithubLogoIcon
		}
	];
</script>

<section class="border-t border-line-faint px-6 py-24 max-md:py-16">
	<div class="mx-auto max-w-[1120px]">
		<SectionHeading
			eyebrow="Ownership & control"
			title="“Yours” isn’t a slogan. It’s a set of buttons."
			subtitle="Real ownership means you can leave, cut off access, and take your data with you — without asking permission."
		/>

		<div class="mt-12 grid grid-cols-3 gap-4 max-md:grid-cols-1">
			{#each controls as { title, body, Icon }}
				<div class="rounded-2xl border border-line-faint bg-elevated/50 p-6">
					<span
						class="flex size-11 items-center justify-center rounded-xl border border-line-faint bg-raised text-muted"
					>
						<Icon size={22} weight="duotone" />
					</span>
					<h3 class="mt-5 text-base font-semibold tracking-tight text-default">{title}</h3>
					<p class="mt-2 text-sm leading-relaxed text-muted">{body}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<script lang="ts">
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import RocketLaunchIcon from 'phosphor-svelte/lib/RocketLaunchIcon';
	import BracketsCurlyIcon from 'phosphor-svelte/lib/BracketsCurlyIcon';
	import TreeStructureIcon from 'phosphor-svelte/lib/TreeStructureIcon';
	import HardDrivesIcon from 'phosphor-svelte/lib/HardDrivesIcon';
	import AtomIcon from 'phosphor-svelte/lib/AtomIcon';
	import AppleLogoIcon from 'phosphor-svelte/lib/AppleLogoIcon';
	import AndroidLogoIcon from 'phosphor-svelte/lib/AndroidLogoIcon';

	/** Platform glyphs shown top-right on the cards that ship one. */
	const sdkPlatforms = [
		{ name: 'Web', Icon: AtomIcon },
		{ name: 'iOS', Icon: AppleLogoIcon },
		{ name: 'Android', Icon: AndroidLogoIcon }
	];

	const resources = [
		{
			title: 'Quickstart',
			body: 'From an OAuth client to your first encrypted read, end to end.',
			href: '/docs/neoworks/quickstart',
			action: 'Start building',
			Icon: RocketLaunchIcon,
			platforms: []
		},
		{
			title: 'SDKs',
			body: 'Use our official SDKs for Web, iOS, and Android.',
			href: '/docs/api',
			action: 'View SDKs',
			Icon: BracketsCurlyIcon,
			platforms: sdkPlatforms
		},
		{
			title: 'OpenSchema',
			body: 'TOML data contracts so apps share shapes instead of copying data.',
			href: '/docs/neoworks/openschema',
			action: 'Read the spec',
			Icon: TreeStructureIcon,
			platforms: []
		},
		{
			title: 'Self-hosting',
			body: 'Run the whole stack yourself. Same OAuth, same SDK, your metal.',
			href: '/docs/neoworks/self-host',
			action: 'See the guide',
			Icon: HardDrivesIcon,
			platforms: []
		}
	];
</script>

<!-- Sits inside the hero over the photo wall, so the cards are opaque enough to
     stay readable against whatever tile lands behind them. -->
<div class="grid w-full grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
	{#each resources as { title, body, href, action, Icon, platforms } (title)}
		<a
			{href}
			class="group flex flex-col rounded-2xl border border-line-faint bg-elevated/90 p-7 backdrop-blur-xl transition-colors hover:border-line hover:bg-raised"
		>
			<div class="flex items-start justify-between gap-3">
				<span
					class="flex size-11 items-center justify-center rounded-xl border border-line-faint bg-raised text-muted"
				>
					<Icon size={22} weight="duotone" />
				</span>
				<span class="flex items-center gap-1.5">
					{#each platforms as platform (platform.name)}
						<span
							title={platform.name}
							class="flex size-8 items-center justify-center rounded-lg border border-line-faint bg-raised text-dim"
						>
							<platform.Icon size={16} weight="regular" />
						</span>
					{/each}
				</span>
			</div>
			<h3 class="mt-5 text-base font-semibold tracking-tight text-default">{title}</h3>
			<p class="mt-2 flex-1 text-sm leading-relaxed text-muted">{body}</p>
			<span class="mt-6 flex items-center gap-1.5 text-[13px] font-medium text-default">
				{action}
				<ArrowRightIcon
					size={13}
					weight="bold"
					class="transition-transform group-hover:translate-x-0.5"
				/>
			</span>
		</a>
	{/each}
</div>

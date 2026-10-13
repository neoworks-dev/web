<script lang="ts">
	import { everydayApps, developerTools, type NavProject } from '$lib/data/projects';

	type FooterLink = { label: string; href?: string; external?: boolean };

	function fromProjects(projects: NavProject[]): FooterLink[] {
		return projects.map((project) => ({ label: project.name, href: project.href, external: project.external }));
	}

	const columns: { heading: string; links: FooterLink[] }[] = [
		{ heading: 'Apps', links: fromProjects(everydayApps) },
		{ heading: 'Developers', links: fromProjects(developerTools) },
		{
			heading: 'Neoworks',
			links: [
				{ label: 'Pricing', href: '/pricing' },
				{ label: 'Security', href: '/#security' },
				{ label: 'How encryption works', href: '/docs/neoworks/encryption' }
			]
		},
		{
			heading: 'Legal',
			links: [
				{ label: 'Privacy', href: '/privacy' },
				{ label: 'Terms', href: '/terms' },
				{ label: 'Security', href: '/security' },
				{ label: 'DPA', href: '/dpa' }
			]
		}
	];

	const social = [
		{ label: 'GitHub', href: 'https://github.com/neoworks-io' },
		{ label: 'Discord', href: 'https://discord.gg/neoworks' },
		{ label: 'X', href: 'https://x.com/neoworks' }
	];

	const year = new Date().getFullYear();

	function linkTargetAttributes(link: FooterLink) {
		if (!link.external) return {};
		return { target: '_blank', rel: 'noopener noreferrer' };
	}
</script>

<!-- The forest floor: carries on from the front ridge of the mountains above it. -->
<footer data-theme="dark" class="relative -mt-1 overflow-hidden bg-ridge-front">
	<div
		class="mx-auto grid max-w-[1120px] grid-cols-[1.6fr_repeat(4,1fr)] gap-8 px-8 pb-16 pt-14
			max-lg:grid-cols-3 max-md:grid-cols-2 max-md:px-5 max-md:pt-10"
	>
		<div class="flex flex-col gap-3 max-lg:col-span-3 max-md:col-span-2">
			<a href="/" class="inline-flex items-center gap-2.5 text-default" aria-label="NeoWorks">
				<svg width="22" height="22" viewBox="0 0 100 100" fill="none" aria-hidden="true">
					<circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="7" />
					<path
						d="M 81 27 C 73 51, 55 69, 26 74"
						stroke="currentColor"
						stroke-width="7"
						stroke-linecap="round"
					/>
				</svg>
				<span class="text-md font-semibold tracking-tight text-default">NeoWorks</span>
			</a>

			<p class="-rotate-2 font-hand text-2xl leading-tight text-brand">
				Your stuff, kept safe.<br />Even from us.
			</p>
		</div>

		{#each columns as column (column.heading)}
			<div class="flex flex-col">
				<h3 class="mb-3 font-hand text-xl leading-none text-brand">{column.heading}</h3>
				<ul class="flex flex-col gap-[2px] p-0">
					{#each column.links as link (link.label)}
						<li>
							{#if link.href}
								<a
									href={link.href}
									{...linkTargetAttributes(link)}
									class="inline-block py-[5px] text-[13px] text-default/80 underline decoration-transparent decoration-wavy underline-offset-4 transition-[color,text-decoration-color] hover:text-default hover:decoration-brand"
									>{link.label}</a
								>
							{:else}
								<span class="inline-block py-[5px] text-[13px] text-default/50">
									{link.label} <span class="font-hand text-sm">soon</span>
								</span>
							{/if}
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>

	<div class="relative border-t border-white/10">
		<!-- Rides along the bottom edge of the footer. -->
		<img
			src="/marmot/cyclist.webp"
			alt=""
			draggable="false"
			class="pointer-events-none absolute bottom-full right-[12%] w-[110px] select-none max-md:right-4 max-md:w-[80px]"
		/>
		<div
			class="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-3 px-8 py-4 max-md:px-5"
		>
			<span class="text-[12px] text-default/65">© {year} NeoWorks, Inc. Built with care for privacy.</span>
			<div class="flex gap-5">
				{#each social as socialLink (socialLink.label)}
					<a
						href={socialLink.href}
						class="text-[12px] text-default/80 transition-colors hover:text-default"
						target="_blank"
						rel="noopener noreferrer">{socialLink.label}</a
					>
				{/each}
			</div>
		</div>
	</div>
</footer>

<script lang="ts">
	const cols = [
		{
			heading: 'Platform',
			links: [
				{ label: 'UserLayer',     href: '/userlayer'    },
				{ label: 'Self-hosting',  href: '/self-host'    },
				{ label: 'OpenSchema',    href: '/openschema'   },
				{ label: 'Pricing',       href: '/pricing'      },
				{ label: 'Changelog',     href: '/changelog'    },
			],
		},
		{
			heading: 'Apps',
			links: [
				{ label: 'Grove',  href: '/apps/grove'  },
				{ label: 'Vine',   href: '/apps/vine'   },
				{ label: 'Tide',   href: '/apps/tide'   },
				{ label: 'Twig',   href: '/apps/twig'   },
				{ label: 'Relay',  href: '/apps/relay'  },
				{ label: 'Vault',  href: '/apps/vault'  },
				{ label: 'Trail',  href: '/apps/trail'  },
			],
		},
		{
			heading: 'Developers',
			links: [
				{ label: 'Docs',           href: '/docs'          },
				{ label: 'OpenSchema',     href: '/openschema'    },
				{ label: 'OAuth guide',    href: '/docs/neoworks/oauth' },
				{ label: 'Profit sharing', href: '/docs/revenue'  },
				{ label: 'GitHub',         href: 'https://github.com/neoworks-io', external: true },
			],
		},
		{
			heading: 'Legal',
			links: [
				{ label: 'Privacy',  href: '/privacy'  },
				{ label: 'Terms',    href: '/terms'    },
				{ label: 'Security', href: '/security' },
				{ label: 'DPA',      href: '/dpa'      },
			],
		},
	];

	const social = [
		{ label: 'GitHub',  href: 'https://github.com/neoworks-io' },
		{ label: 'Discord', href: 'https://discord.gg/neoworks'    },
		{ label: 'X',       href: 'https://x.com/neoworks'         },
	];

	const year = new Date().getFullYear();
</script>

<footer class="relative border-t border-line bg-elevated">
	<!-- Accent glow on the divider -->
	<div class="pointer-events-none absolute left-[10%] right-[10%] top-[-1px] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

	<!-- Main grid -->
	<div class="mx-auto grid max-w-[1120px] grid-cols-[1.8fr_repeat(4,1fr)] gap-8 px-8 pb-8 pt-11
				max-lg:grid-cols-3 max-md:grid-cols-2 max-md:px-5 max-md:pt-8">

		<!-- Brand column -->
		<div class="flex flex-col gap-4 max-lg:col-span-3 max-md:col-span-2">
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

			<p class="max-w-[200px] text-[13px] leading-relaxed text-muted">
				Your data, your rules.<br/>
				A personal cloud built on ownership, not surveillance.
			</p>

			<span class="font-mono text-[10px] tracking-[0.08em] text-faint">neoworks.dev</span>
		</div>

		<!-- Link columns -->
		{#each cols as col}
			<div class="flex flex-col">
				<h3 class="mb-3.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-dim">
					{col.heading}
				</h3>
				<ul class="flex flex-col gap-[2px] p-0">
					{#each col.links as link}
						<li>
							<a
								href={link.href}
								class="inline-block py-[5px] text-[13px] text-muted transition-colors hover:text-default"
								target={link.external ? '_blank' : undefined}
								rel={link.external ? 'noopener noreferrer' : undefined}
							>{link.label}</a>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>

	<!-- Bottom bar -->
	<div class="border-t border-line-faint">
		<div class="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-3 px-8 py-3 max-md:px-5">
			<span class="font-mono text-[11px] tracking-[0.02em] text-faint">
				© {year} NeoWorks, Inc. — Built with care for privacy.
			</span>
			<div class="flex gap-5">
				{#each social as s}
					<a
						href={s.href}
						class="text-[12px] text-muted transition-colors hover:text-default"
						target="_blank"
						rel="noopener noreferrer"
					>{s.label}</a>
				{/each}
			</div>
		</div>
	</div>
</footer>
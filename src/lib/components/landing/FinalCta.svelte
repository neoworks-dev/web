<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
</script>

<section class="relative overflow-hidden border-t border-line-faint px-6 py-28 max-md:py-20">
	<!-- Pegboard dot field, faded toward the edges. -->
	<div
		class="pegboard pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
	></div>

	<div class="relative mx-auto max-w-[640px] text-center">
		<h2 class="text-[clamp(30px,4vw,48px)] font-semibold leading-[1.02] tracking-tight text-default">
			Your data is ready to come home.
		</h2>
		<p class="mx-auto mt-5 max-w-[440px] text-[15px] leading-relaxed text-muted">
			Create your encrypted account in under a minute. Free to start, yours forever, and portable
			the day you want to leave.
		</p>

		<div class="mt-8 flex flex-wrap items-center justify-center gap-3">
			<a
				href={resolve('/auth/signup')}
				class="flex items-center gap-2 rounded-full bg-action px-5 py-2.5 text-sm font-semibold text-action-fg transition-opacity hover:opacity-90 active:scale-[0.98]"
			>
				Create your account
				<ArrowRightIcon size={15} weight="bold" />
			</a>
			<a
				href="/#apps"
				class="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-hover hover:text-default"
			>
				Explore the ecosystem
			</a>
		</div>

		<p class="mt-8 font-mono text-[10px] uppercase tracking-[0.1em] text-faint">
			No ads · No tracking · MIT licensed · Self-hostable
		</p>
	</div>
</section>

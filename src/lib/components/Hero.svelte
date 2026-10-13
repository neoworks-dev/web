<script lang="ts">
	import { resolve } from '$app/paths';
	import Scrapbook from './landing/scrapbook/Scrapbook.svelte';
	import MountainBackdrop from './landing/scrapbook/MountainBackdrop.svelte';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import LockKeyIcon from 'phosphor-svelte/lib/LockKeyIcon';
</script>

<section
	class="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-32 max-md:pt-28"
>
	<MountainBackdrop>
		{#snippet behindFrontRidge()}
			<!-- Stands guard behind the front ridge, which hides its feet. -->
			<img
				src="/marmot/sentinel.webp"
				alt=""
				draggable="false"
				class="absolute -bottom-[3%] left-[47%] w-[150px] max-md:hidden"
			/>
		{/snippet}
	</MountainBackdrop>

	<div class="relative mx-auto max-w-[820px] text-center">
		<h1
			class="animate-rise text-[clamp(40px,6vw,76px)] font-semibold leading-[1] tracking-tight text-default motion-reduce:animate-none"
		>
			Your stuff, kept safe.
			<span class="relative -mt-3 ml-[18%] block w-fit -rotate-6 font-hand text-[1.3em] font-medium text-brand">
				Even from us.
				<svg
					aria-hidden="true"
					viewBox="0 0 300 24"
					class="absolute -bottom-2 left-0 h-[0.3em] w-full text-brand"
					preserveAspectRatio="none"
				>
					<path
						d="M4 16 C 60 6, 140 4, 296 12 M 30 21 C 110 13, 200 13, 270 18"
						fill="none"
						stroke="currentColor"
						stroke-width="4"
						stroke-linecap="round"
					/>
				</svg>
			</span>
		</h1>

		<p
			class="mx-auto mt-6 max-w-[500px] animate-rise text-[clamp(15px,1.6vw,18px)] leading-relaxed text-muted [animation-delay:100ms] motion-reduce:animate-none"
		>
			Photos, files, calendar, contacts and mail, encrypted on your device. Nobody else can look
			at them: not advertisers, not AI training, not us.
		</p>

		<div
			class="relative mt-9 flex animate-rise flex-wrap items-center justify-center gap-3 [animation-delay:200ms] motion-reduce:animate-none"
		>
			<a
				href={resolve('/auth/signup')}
				class="flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-brand-fg transition-colors hover:bg-brand-hover active:scale-[0.98]"
			>
				Start for free
				<ArrowRightIcon size={15} weight="bold" />
			</a>
			<!-- Doodled note pointing at the main button. -->
			<span
				aria-hidden="true"
				class="pointer-events-none absolute left-[118px] -top-14 flex -rotate-6 flex-col items-end max-md:hidden"
			>
				<span class="font-hand text-2xl text-brand">start here</span>
				<svg viewBox="0 0 120 60" class="-mt-1 mr-2 h-[50px] w-[100px] text-brand">
					<path
						d="M6 6 C 30 40, 70 52, 108 44 M 96 34 L 110 44 L 96 54"
						fill="none"
						stroke="currentColor"
						stroke-width="3"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</span>
			<a
				href={resolve('/pricing')}
				class="rounded-md border border-line bg-surface px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-hover hover:text-default"
			>
				See pricing
			</a>
		</div>

		<p
			class="mx-auto mt-5 flex w-fit animate-rise items-center justify-center gap-1.5 rounded-[3px] bg-surface px-3 py-1.5 text-xs font-medium text-muted shadow-sm [animation-delay:280ms] motion-reduce:animate-none"
		>
			<LockKeyIcon size={13} weight="bold" />
			End-to-end encrypted. Take your data with you anytime.
		</p>
	</div>

	<!-- On desktop the items scatter around the copy; on mobile they wrap below it. -->
	<div
		class="mt-12 flex flex-wrap items-start justify-center gap-6 md:pointer-events-none md:absolute md:inset-0 md:mt-0 md:[&>*]:pointer-events-auto"
	>
		<Scrapbook />
	</div>
</section>

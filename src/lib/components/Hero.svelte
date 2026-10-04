<script lang="ts">
	import { resolve } from '$app/paths';
	import HeroGallery from './HeroGallery.svelte';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import LockKeyIcon from 'phosphor-svelte/lib/LockKeyIcon';
	import { heroPhotos } from '$lib/heroPhotos';
</script>

<section class="relative flex min-h-screen items-center overflow-hidden">
  <HeroGallery images={heroPhotos} />

  <!-- Soften the wall behind the copy for legibility. -->
  <div
    class="pointer-events-none absolute inset-0 z-30 bg-[radial-gradient(ellipse_58%_62%_at_28%_50%,var(--bg)_20%,transparent_72%)]"
  ></div>

  <div
    class="pointer-events-none relative z-40 mx-auto w-full max-w-[1240px] px-6 pb-28 pt-32"
  >
    <div class="max-w-[720px]">
      <h1
        class="text-[clamp(34px,4.4vw,56px)] font-semibold leading-[1.05] tracking-tight text-default"
      >
        <span class="block">Your life is out there.</span>
        <span class="block text-muted">Reclaim it.</span>
      </h1>

      <p
        class="mt-6 max-w-[510px] text-[clamp(15px,1.6vw,18px)] leading-relaxed text-muted"
      >
        Your photos, messages and conversations sit on someone else's servers,
        feeding someone else's ads. NeoWorks builds what you actually use —
        maps, chat, calendars and contacts — and encrypts everything on your
        device. Nobody, us included, can read it.
      </p>

      <div class="pointer-events-auto mt-9 flex flex-wrap items-center gap-3">
        <a
          href={resolve("/auth/signup")}
          class="flex items-center gap-2 rounded-full bg-action px-5 py-2.5 text-sm font-semibold text-action-fg transition-opacity hover:opacity-90 active:scale-[0.98]"
        >
          Reclaim your data
          <ArrowRightIcon size={15} weight="bold" />
        </a>
        <a
          href="/#apps"
          class="rounded-full border border-line bg-elevated/60 px-5 py-2.5 text-sm font-medium text-muted backdrop-blur-md transition-colors hover:bg-hover hover:text-default"
        >
          See the apps
        </a>
      </div>

      <p class="mt-5 flex items-center gap-1.5 text-xs font-medium text-dim">
        <LockKeyIcon size={13} weight="bold" />
        Encrypted on your device. No ads, no tracking. Leave with your data anytime.
      </p>

    </div>
  </div>
</section>

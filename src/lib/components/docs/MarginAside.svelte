<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children, aside }: { children?: Snippet; aside: Snippet } = $props();

	let asideHeight = $state(0);
</script>

<!-- A section of the page and the aside that goes with it. On wide screens the aside sits in
     the right margin, pinned while the section is read and marked by a highlighter bar. -->
<div class="margin-aside relative xl:min-h-[var(--aside-height)]" style="--aside-height: {asideHeight}px">
	<span
		aria-hidden="true"
		class="absolute inset-y-0 left-[calc(100%+20px)] w-[4px] rounded-full bg-brand max-xl:hidden"
	></span>
	<span
		aria-hidden="true"
		class="absolute left-[calc(100%+20px)] top-5 h-[4px] w-[56px] rounded-full bg-brand max-xl:hidden"
	></span>

	{@render children?.()}

	<div class="xl:absolute xl:inset-y-0 xl:left-[calc(100%+76px)] xl:w-[400px]">
		<div bind:clientHeight={asideHeight} class="xl:sticky xl:top-28">
			{@render aside()}
		</div>
	</div>
</div>

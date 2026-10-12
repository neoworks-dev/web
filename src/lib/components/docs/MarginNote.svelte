<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<!-- A handwritten sticky note. On wide screens it floats into the right margin, level with the
     paragraph after it; below that it sits in the text. Notes in a row stack instead of overlapping. -->
<aside
	class="not-prose relative my-6 -rotate-[1deg] rounded-[2px] bg-note px-5 pb-4 pt-5 font-hand text-[1.35rem] leading-snug text-ink shadow-[0_6px_14px_rgba(0,0,0,0.12)] xl:float-right xl:clear-right xl:-mr-[364px] xl:mb-6 xl:mt-0 xl:w-[320px]"
>
	<span
		aria-hidden="true"
		class="absolute -top-2.5 left-1/2 h-5 w-16 -translate-x-1/2 rotate-2 bg-tape shadow-sm"
	></span>
	{@render children?.()}
</aside>

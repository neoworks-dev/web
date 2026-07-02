<script lang="ts">
	let {
		eyebrow,
		title,
		subtitle = '',
		align = 'left'
	}: {
		eyebrow: string;
		title: string;
		subtitle?: string;
		align?: 'left' | 'center';
	} = $props();
</script>

<div class={align === 'center' ? 'mx-auto max-w-[640px] text-center' : 'max-w-[640px]'}>
	<span class="font-mono text-[11px] uppercase tracking-[0.14em] text-dim">{eyebrow}</span>
	<h2 class="mt-3 text-[clamp(28px,3.5vw,40px)] font-semibold leading-[1.05] tracking-tight text-default">
		{title}
	</h2>
	{#if subtitle}
		<p class="mt-4 text-[15px] leading-relaxed text-muted">{subtitle}</p>
	{/if}
</div>

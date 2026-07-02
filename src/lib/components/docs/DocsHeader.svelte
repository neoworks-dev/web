<script lang="ts">
	import { page } from '$app/stores';
	import { docProducts, productForPath } from '$lib/data/docsNav';

	const active = $derived(productForPath($page.url.pathname));
</script>

<!-- Sub-nav row attached under the main header: one tab per documented product. -->
<nav class="flex items-center gap-1 overflow-x-auto px-3">
	{#each docProducts as product}
		{@const Icon = product.icon}
		{@const isActive = product.id === active.id}
		<a
			href={product.href}
			aria-current={isActive ? 'page' : undefined}
			class="flex shrink-0 items-center gap-1.5 border-b-2 px-2.5 py-2 text-sm font-medium transition-colors {isActive
				? 'border-default text-default'
				: 'border-transparent text-muted hover:text-default'}"
		>
			<Icon size={14} weight="duotone" color={product.accent} />
			{product.label}
		</a>
	{/each}
</nav>

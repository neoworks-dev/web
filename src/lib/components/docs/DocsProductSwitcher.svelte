<script lang="ts">
	import { goto } from '$app/navigation';
	import { Select } from '@neoworks-dev/ui';
	import { docProducts, type DocProduct } from '$lib/data/docsNav';

	let { activeProduct }: { activeProduct: DocProduct } = $props();

	const options = docProducts.map((product) => ({
		value: product.id,
		label: product.label,
		icon: product.icon,
		description: product.tagline
	}));

	function openProduct(productId: string | string[]) {
		const product = docProducts.find((candidate) => candidate.id === productId);
		if (product === undefined) return;
		goto(product.href);
	}
</script>

<Select value={activeProduct.id} onChange={openProduct} {options} />

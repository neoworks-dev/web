<script lang="ts">
	import { generalError, type FormFailureData } from '$lib/developer/formErrors';

	let {
		form,
		name,
		fields = [],
	}: { form: FormFailureData | null | undefined; name: string; fields?: string[] } = $props();

	const message = $derived(generalError(form, name, fields));
</script>

{#if message !== ''}
	<p class="rounded-lg bg-red-soft px-3 py-2 text-sm text-red" role="alert">{message}</p>
{/if}

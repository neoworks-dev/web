<script lang="ts">
	let {
		label,
		name,
		value = $bindable(''),
		type = 'text',
		placeholder = '',
		hint = '',
		error = '',
		multiline = false,
		rows = 3,
		disabled = false,
	}: {
		label: string;
		name: string;
		value?: string;
		type?: 'text' | 'url' | 'email';
		placeholder?: string;
		hint?: string;
		error?: string;
		multiline?: boolean;
		rows?: number;
		disabled?: boolean;
	} = $props();
</script>

<label class="flex flex-col gap-1.5">
	<span class="text-xs font-medium text-muted">{label}</span>
	{#if multiline}
		<textarea
			{name}
			{rows}
			{placeholder}
			{disabled}
			bind:value
			aria-invalid={error !== ''}
			class="w-full rounded-lg border border-line bg-input px-3 py-2 font-mono text-sm text-default placeholder:text-faint focus:border-line-strong focus:outline-none disabled:opacity-50"
		></textarea>
	{:else}
		<input
			{name}
			{type}
			{placeholder}
			{disabled}
			bind:value
			aria-invalid={error !== ''}
			class="h-10 w-full rounded-lg border border-line bg-input px-3 text-sm text-default placeholder:text-faint focus:border-line-strong focus:outline-none disabled:opacity-50"
		/>
	{/if}
	{#if error !== ''}
		<span class="text-xs text-red" role="alert">{error}</span>
	{:else if hint !== ''}
		<span class="text-xs text-dim">{hint}</span>
	{/if}
</label>

<script lang="ts">
	import { highlightCode } from '$lib/docs/highlight';
	import CopyButton from './CopyButton.svelte';

	type RequestVariant = { label: string; language: string; code: string };
	type ExampleResponse = { status: number; statusText?: string; body?: unknown };

	let {
		method,
		path,
		description = '',
		requests,
		response,
		class: className = 'my-8'
	}: {
		method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
		path: string;
		description?: string;
		/** One tab each, for example curl and the TypeScript SDK. */
		requests: readonly RequestVariant[];
		/** `body` is shown as formatted JSON; leave it out for an empty response. */
		response: ExampleResponse;
		class?: string;
	} = $props();

	let selectedIndex = $state(0);
	const selected = $derived(requests[selectedIndex]);

	const responseText = $derived.by(() => {
		if (response.body === undefined) return '';
		if (typeof response.body === 'string') return response.body;
		return JSON.stringify(response.body, null, 2);
	});
	const isSuccess = $derived(response.status < 400);
</script>

<section class={['code-panel not-prose overflow-hidden', className]}>
	<header class="flex flex-wrap items-center gap-3 border-b border-white/10 px-4 py-2.5">
		<span
			class={[
				'rounded px-2 py-0.5 font-mono text-xs font-bold',
				{
					'bg-[#2f5d46] text-[#bfe8cf]': method === 'GET',
					'bg-[#35557a] text-[#c4dcf5]': method === 'POST',
					'bg-[#6b5524] text-[#f2dc9b]': method === 'PUT' || method === 'PATCH',
					'bg-[#6f2f2f] text-[#f5c4c4]': method === 'DELETE'
				}
			]}>{method}</span
		>
		<code class="font-mono text-sm text-[#ece9e1]">{path}</code>
		{#if description !== ''}
			<span class="ml-auto text-xs text-[#a3a3a8] max-md:hidden">{description}</span>
		{/if}
	</header>

	<div class="flex items-center justify-between border-b border-white/10 pl-2 pr-2">
		<div role="tablist" class="flex">
			{#each requests as variant, index (variant.label)}
				<button
					type="button"
					role="tab"
					aria-selected={index === selectedIndex}
					onclick={() => (selectedIndex = index)}
					class={[
						'border-b-2 px-3 py-2 text-xs transition-colors',
						{
							'border-[#5cbf8c] text-[#ece9e1]': index === selectedIndex,
							'border-transparent text-[#a3a3a8] hover:text-[#ece9e1]': index !== selectedIndex
						}
					]}
				>
					{variant.label}
				</button>
			{/each}
		</div>
		<CopyButton text={selected.code} />
	</div>
	<pre class="overflow-x-auto px-4 py-3.5 text-[0.8125rem] leading-relaxed"><code
			>{@html highlightCode(selected.code, selected.language)}</code
		></pre>

	<div class="flex items-center gap-2 border-y border-white/10 bg-black/20 px-4 py-2">
		<span class="font-mono text-xs uppercase tracking-wide text-[#a3a3a8]">Response</span>
		<span
			class={[
				'rounded px-2 py-0.5 font-mono text-xs font-bold',
				{
					'bg-[#2f5d46] text-[#bfe8cf]': isSuccess,
					'bg-[#6f2f2f] text-[#f5c4c4]': !isSuccess
				}
			]}
		>
			{response.status}
			{response.statusText}
		</span>
		{#if responseText !== ''}
			<CopyButton text={responseText} class="ml-auto" />
		{/if}
	</div>
	{#if responseText !== ''}
		<pre class="overflow-x-auto px-4 py-3.5 text-[0.8125rem] leading-relaxed"><code
				>{@html highlightCode(responseText, 'json')}</code
			></pre>
	{/if}
</section>

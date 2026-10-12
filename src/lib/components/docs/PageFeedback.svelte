<script lang="ts">
	import { onMount } from 'svelte';
	import Marmot from '$lib/components/landing/scrapbook/Marmot.svelte';
	import ThumbsUpIcon from 'phosphor-svelte/lib/ThumbsUpIcon';
	import ThumbsDownIcon from 'phosphor-svelte/lib/ThumbsDownIcon';

	type Vote = 'yes' | 'no';

	let { pathname, pageTitle = '' }: { pathname: string; pageTitle?: string } = $props();

	let vote = $state<Vote | undefined>();

	const storageKey = $derived(`docs-feedback:${pathname}`);
	const issueUrl = $derived.by(() => {
		let subject = pageTitle;
		if (subject === '') subject = pathname;
		const title = encodeURIComponent(`Docs: ${subject}`);
		const body = encodeURIComponent(`Page: https://neoworks.dev${pathname}\n\nWhat was missing or unclear?\n`);
		return `https://github.com/neoworks-dev/neoworks.dev/issues/new?title=${title}&body=${body}`;
	});

	onMount(() => {
		const saved = localStorage.getItem(storageKey);
		if (saved === 'yes' || saved === 'no') vote = saved;
	});

	// Answers stay in this browser; nothing is sent anywhere.
	function answer(nextVote: Vote) {
		vote = nextVote;
		localStorage.setItem(storageKey, nextVote);
	}
</script>

<div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
	{#if vote === undefined}
		<span class="font-hand text-xl text-default">Was this helpful?</span>
		<div class="flex gap-2">
			<button
				type="button"
				onclick={() => answer('yes')}
				class="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-surface px-3.5 py-1 transition-colors hover:bg-note hover:text-ink"
			>
				<ThumbsUpIcon size={16} /> Yes
			</button>
			<button
				type="button"
				onclick={() => answer('no')}
				class="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-surface px-3.5 py-1 transition-colors hover:bg-note hover:text-ink"
			>
				<ThumbsDownIcon size={16} /> No
			</button>
		</div>
	{:else if vote === 'yes'}
		<Marmot pose="callouts/tip-6" class="h-[64px] w-auto" />
		<span class="font-hand text-xl text-default" aria-live="polite">Glad it helped!</span>
	{:else}
		<span class="font-hand text-xl text-default" aria-live="polite">Sorry about that.</span>
		<a href={issueUrl} target="_blank" rel="noreferrer" class="underline underline-offset-2 hover:text-default">
			Tell us what was missing
		</a>
	{/if}
</div>

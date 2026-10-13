<script lang="ts">
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import NavProjectList from './NavProjectList.svelte';
	import type { NavFeature, NavProject } from '$lib/data/projects';

	let {
		projects,
		feature,
		onNavigate = () => {}
	}: { projects: NavProject[]; feature: NavFeature; onNavigate?: () => void } = $props();
</script>

<div class="grid w-[640px] grid-cols-[1fr_210px] gap-2">
	<NavProjectList {projects} {onNavigate} class="grid-cols-2 content-start" />

	<a
		href={feature.href}
		role="menuitem"
		onclick={onNavigate}
		class="group relative flex min-h-[200px] flex-col justify-end overflow-hidden rounded-xl bg-brand p-4 text-brand-fg"
	>
		{#if feature.image}
			<img
				src={feature.image}
				alt=""
				class="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
			/>
			<span class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></span>
		{/if}
		<span class="relative text-[15px] font-semibold tracking-tight text-white">{feature.title}</span>
		<span class="relative mt-1 text-xs leading-snug text-white/80">{feature.body}</span>
		<ArrowRightIcon
			size={14}
			weight="bold"
			class="relative mt-3 text-white transition-transform group-hover:translate-x-0.5"
		/>
	</a>
</div>

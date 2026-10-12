<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	import type { NavProject } from '$lib/data/projects';

	let {
		projects,
		onNavigate = () => {},
		class: className = ''
	}: { projects: NavProject[]; onNavigate?: () => void; class?: ClassValue } = $props();

	function linkTargetAttributes(project: NavProject) {
		if (!project.external) return {};
		return { target: '_blank', rel: 'noopener noreferrer' };
	}
</script>

{#snippet projectRow(project: NavProject)}
	<span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
		<project.icon size={17} weight="duotone" />
	</span>
	<span class="flex min-w-0 flex-col gap-px">
		<span class="text-[13px] font-medium tracking-tight text-default">{project.name}</span>
		<span class="truncate text-2xs text-dim">{project.tagline}</span>
	</span>
{/snippet}

<div class={['grid gap-0.5', className]}>
	{#each projects as project (project.name)}
		{#if project.href}
			<a
				href={project.href}
				{...linkTargetAttributes(project)}
				role="menuitem"
				onclick={onNavigate}
				class="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-hover"
			>
				{@render projectRow(project)}
			</a>
		{:else}
			<div class="flex items-center gap-3 rounded-lg p-2 opacity-60">
				{@render projectRow(project)}
				<span class="ml-auto rounded-full border border-line px-2 py-0.5 text-2xs font-medium text-dim">
					Soon
				</span>
			</div>
		{/if}
	{/each}
</div>

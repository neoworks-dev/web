<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	import { reveal } from '$lib/actions/reveal';

	type Pose =
		| 'archivist'
		| 'briefcase'
		| 'burrow'
		| 'chest'
		| 'cyclist'
		| 'filing'
		| 'guard'
		| 'hiker'
		| 'polaroid'
		| 'sentinel'
		| 'sleeping';

	let { pose, class: className = '' }: { pose: Pose; class?: ClassValue } = $props();
</script>

<img
	use:reveal={{ delay: 150 }}
	src="/marmot/{pose}.webp"
	alt=""
	draggable="false"
	class={['pointer-events-none select-none', className]}
/>

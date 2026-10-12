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
		| 'photographer'
		| 'polaroid'
		| 'reader'
		| 'sentinel'
		| 'sleeping'
		| `callouts/${'note' | 'tip' | 'warning' | 'danger'}-${1 | 2 | 3 | 4 | 5 | 6}`;

	let { pose, class: className = '' }: { pose: Pose; class?: ClassValue } = $props();
</script>

<img
	use:reveal={{ delay: 150 }}
	src="/marmot/{pose}.webp"
	alt=""
	draggable="false"
	class={['pointer-events-none select-none', className]}
/>

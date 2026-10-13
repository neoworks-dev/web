<script lang="ts">
	type Variant = 'shore' | 'field';
	type Wave = { frequency: number; amplitude: number; phase: number };

	let { variant, fill }: { variant: Variant; fill: string } = $props();

	const WIDTH = 1440;
	const HEIGHT = 100;
	const STEPS = 96;

	const shapes: Record<Variant, { base: number; waves: Wave[] }> = {
		shore: {
			base: 52,
			waves: [
				{ frequency: 2.3, amplitude: 12, phase: 0.5 },
				{ frequency: 9.1, amplitude: 3, phase: 1.3 }
			]
		},
		field: {
			base: 50,
			waves: [
				{ frequency: 1.2, amplitude: 22, phase: 2 },
				{ frequency: 3.4, amplitude: 8, phase: 0.2 }
			]
		}
	};

	function heightAt(x: number): number {
		const { base, waves } = shapes[variant];
		let y = base;
		for (const wave of waves) {
			y -= wave.amplitude * Math.sin((x / WIDTH) * Math.PI * 2 * wave.frequency + wave.phase);
		}
		return Math.round(y * 10) / 10;
	}

	function edgePoints(): string {
		const points: string[] = [];
		for (let step = 0; step <= STEPS; step++) {
			const x = (WIDTH * step) / STEPS;
			points.push(`${x},${heightAt(x)}`);
		}
		return points.join(' L');
	}

	const edge = $derived(`M${edgePoints()}`);
	const area = $derived(`M0,${HEIGHT} L${edgePoints()} L${WIDTH},${HEIGHT} Z`);

	// Short marks drawn just below the edge: ripples on water, grass tufts in a field.
	const markPositions = [90, 260, 470, 690, 880, 1090, 1290];

	function markPath(x: number): string {
		const y = heightAt(x) + 22;
		if (variant === 'shore') {
			return `M${x - 18},${y} q6,-5 12,0 t12,0 t12,0`;
		}
		return `M${x - 8},${y} l4,-10 M${x},${y} l0,-13 M${x + 8},${y} l-4,-10`;
	}
</script>

<!-- Sits on top of its section, so the edge rises into whatever is above it. -->
<svg
	aria-hidden="true"
	viewBox="0 0 {WIDTH} {HEIGHT}"
	preserveAspectRatio="none"
	class="pointer-events-none absolute inset-x-0 bottom-[calc(100%-3px)] h-[90px] w-full"
>
	<path d={area} {fill} />
	<path
		d={edge}
		fill="none"
		stroke="var(--ink)"
		stroke-width="2.5"
		stroke-linejoin="round"
		vector-effect="non-scaling-stroke"
	/>
	{#each markPositions as x (x)}
		<path
			d={markPath(x)}
			fill="none"
			stroke="var(--ink)"
			stroke-width="1.8"
			stroke-linecap="round"
			opacity="0.55"
			vector-effect="non-scaling-stroke"
		/>
	{/each}
</svg>

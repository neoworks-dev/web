<script lang="ts">
	import { onMount } from 'svelte';
	import { isNight, prefersReducedMotion, switchTheme } from '$lib/sky.svelte';
	import {
		advanceMoon,
		isFlungOut,
		isSettled,
		restingPosition,
		stringPath,
		type MoonBody,
		type Point
	} from './moonString';

	let { sunClass = '' }: { sunClass?: string } = $props();

	/** How far the sun has to be pulled down, in pixels, to set it. */
	const sunSwitchDistance = 120;
	/** How close to the top the moon has to be let go, as a share of the string, to end the night. */
	const moonSwitchShare = 0.35;
	/** Where the string holds the crescent, in the crescent's own pixels. */
	const crescentHold = { x: 23, y: 17 };
	const crescentTiltDegrees = 18;

	type SunDrag = { kind: 'sun'; startY: number };
	type MoonDrag = { kind: 'moon'; grabOffset: Point; lastPoint: Point; lastTime: number };

	let stage: HTMLDivElement;
	let sun: HTMLDivElement;
	let sunDisk: HTMLDivElement;
	let crescent: SVGSVGElement;

	let stageWidth = $state(0);
	let stageHeight = $state(0);
	let moon: MoonBody = $state({ position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 } });
	let moonIsLoose = $state(false);

	let drag: SunDrag | MoonDrag | undefined;
	let animationFrame = 0;
	let previousFrameTime = 0;

	const anchor = $derived({ x: stageWidth * 0.24, y: 0 });
	const stringLength = $derived(stageHeight * 0.2);

	const moonPosition = $derived.by(() => {
		if (moonIsLoose) return moon.position;
		return restingPosition(anchor, stringLength);
	});

	/** The crescent turns with its string as it swings. */
	const crescentRotation = $derived.by(() => {
		const swing = Math.atan2(moonPosition.x - anchor.x, moonPosition.y - anchor.y);
		return crescentTiltDegrees - (swing * 180) / Math.PI;
	});

	onMount(() => {
		document.addEventListener('pointerdown', handlePointerDown);
		return () => {
			document.removeEventListener('pointerdown', handlePointerDown);
			stopListeningToDrag();
			cancelAnimationFrame(animationFrame);
		};
	});

	function handlePointerDown(event: PointerEvent) {
		if (event.button !== 0 || event.defaultPrevented) return;
		if (!sceneFollowsTheme() || prefersReducedMotion()) return;
		if (isInteractive(event.target)) return;

		if (isNight() && hits(crescent, event)) {
			startMoonDrag(event);
			return;
		}
		if (!isNight() && hits(sunDisk, event)) startSunDrag(event);
	}

	function handlePointerMove(event: PointerEvent) {
		if (drag === undefined) return;
		if (drag.kind === 'sun') {
			sun.style.translate = `0 ${sunPull(event.clientY - drag.startY)}px`;
			return;
		}
		moveMoon(event, drag);
	}

	function handlePointerUp(event: PointerEvent) {
		const finishedDrag = drag;
		stopListeningToDrag();
		if (finishedDrag === undefined) return;
		if (finishedDrag.kind === 'sun') {
			releaseSun(sunPull(event.clientY - finishedDrag.startY));
			return;
		}
		releaseMoon();
	}

	function startSunDrag(event: PointerEvent) {
		listenToDrag(event, { kind: 'sun', startY: event.clientY });
		sun.style.transition = 'none';
	}

	/** Pulling down follows the pointer; pushing up meets resistance. */
	function sunPull(distance: number): number {
		if (distance >= 0) return distance;
		return distance * 0.25;
	}

	function releaseSun(pulled: number) {
		if (pulled < sunSwitchDistance) {
			springSunBack();
			return;
		}
		// Dropping the inline styles lets the night transition carry on from where the sun was let go.
		sun.style.removeProperty('transition');
		sun.style.removeProperty('translate');
		switchTheme('dark');
	}

	function springSunBack() {
		sun.style.transition = 'translate 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
		sun.style.translate = '0 0';
		setTimeout(() => {
			sun.style.removeProperty('transition');
			sun.style.removeProperty('translate');
		}, 600);
	}

	function startMoonDrag(event: PointerEvent) {
		cancelAnimationFrame(animationFrame);
		const point = stagePoint(event);
		const position = { ...moonPosition };
		moon = { position, velocity: { x: 0, y: 0 } };
		moonIsLoose = true;
		const grabOffset = { x: point.x - position.x, y: point.y - position.y };
		listenToDrag(event, { kind: 'moon', grabOffset, lastPoint: point, lastTime: event.timeStamp });
	}

	function moveMoon(event: PointerEvent, moonDrag: MoonDrag) {
		const point = stagePoint(event);
		const seconds = Math.max((event.timeStamp - moonDrag.lastTime) / 1000, 1 / 240);
		moon = {
			position: { x: point.x - moonDrag.grabOffset.x, y: point.y - moonDrag.grabOffset.y },
			velocity: {
				x: (point.x - moonDrag.lastPoint.x) / seconds,
				y: (point.y - moonDrag.lastPoint.y) / seconds
			}
		};
		moonDrag.lastPoint = point;
		moonDrag.lastTime = event.timeStamp;
	}

	function releaseMoon() {
		if (moon.position.y > stringLength * moonSwitchShare) {
			previousFrameTime = performance.now();
			animationFrame = requestAnimationFrame(swingMoon);
			return;
		}
		endNight();
	}

	function endNight() {
		switchTheme('light');
		// Hang it back up once it has left the sky, ready for the next night.
		setTimeout(() => {
			moonIsLoose = false;
		}, 1000);
	}

	function swingMoon(now: number) {
		const seconds = Math.min((now - previousFrameTime) / 1000, 0.05);
		previousFrameTime = now;
		moon = advanceMoon(moon, anchor, stringLength, seconds);
		if (isFlungOut(moon)) {
			endNight();
			return;
		}
		if (isSettled(moon, anchor, stringLength)) {
			moonIsLoose = false;
			return;
		}
		animationFrame = requestAnimationFrame(swingMoon);
	}

	function listenToDrag(event: PointerEvent, nextDrag: SunDrag | MoonDrag) {
		event.preventDefault();
		drag = nextDrag;
		window.addEventListener('pointermove', handlePointerMove);
		window.addEventListener('pointerup', handlePointerUp);
		window.addEventListener('pointercancel', handlePointerUp);
	}

	function stopListeningToDrag() {
		drag = undefined;
		window.removeEventListener('pointermove', handlePointerMove);
		window.removeEventListener('pointerup', handlePointerUp);
		window.removeEventListener('pointercancel', handlePointerUp);
	}

	/** Always-light pages keep their sun up whatever the theme. */
	function sceneFollowsTheme(): boolean {
		const sceneRoot = stage.closest('[data-scene-root]');
		if (sceneRoot === null) return false;
		return sceneRoot.getAttribute('data-theme') !== 'light';
	}

	function isInteractive(target: EventTarget | null): boolean {
		if (!(target instanceof Element)) return false;
		return target.closest('a, button, input, textarea, select, label') !== null;
	}

	/** Hit-tested by position: the hero's text box sits on top of both and would swallow the event. */
	function hits(element: Element, event: PointerEvent): boolean {
		const box = element.getBoundingClientRect();
		const insideX = event.clientX >= box.left && event.clientX <= box.right;
		return insideX && event.clientY >= box.top && event.clientY <= box.bottom;
	}

	function stagePoint(event: PointerEvent): Point {
		const box = stage.getBoundingClientRect();
		return { x: event.clientX - box.left, y: event.clientY - box.top };
	}
</script>

<div class={['absolute left-[64%] top-[40%]', sunClass]} style="--scroll-shift: 200px">
	<!-- Held up from below on a stick, like a stage prop; the ridges hide the stick's foot. -->
	<div bind:this={sun} class="sun relative">
		<span
			class="absolute left-1/2 top-1/2 h-[560px] w-[8px] -translate-x-1/2 rounded-full border-[2px] border-ink bg-[#a8743f]"
		></span>
		<div
			bind:this={sunDisk}
			class="relative size-[150px] rounded-full border-[2.5px] border-ink bg-sun shadow-[0_0_120px_60px_var(--sun)]"
		></div>
	</div>
</div>

<!-- Lowered on a string at night, like a stage prop. -->
<div
	bind:this={stage}
	bind:clientWidth={stageWidth}
	bind:clientHeight={stageHeight}
	class={['moon absolute inset-0', { loose: moonIsLoose }]}
>
	<svg class="absolute inset-0 size-full overflow-visible">
		<path
			d={stringPath(anchor, moonPosition, stringLength)}
			fill="none"
			stroke="rgba(243, 239, 228, 0.45)"
			stroke-width="1.5"
		/>
	</svg>
	<svg
		bind:this={crescent}
		viewBox="-4 4 108 98"
		class="absolute left-0 top-0 w-[110px] drop-shadow-[0_0_28px_rgba(239,230,196,0.3)]"
		style="translate: {moonPosition.x - crescentHold.x}px {moonPosition.y -
			crescentHold.y}px; rotate: {crescentRotation}deg; transform-origin: {crescentHold.x}px {crescentHold.y}px"
	>
		<path
			d="M49.5 8 A44 44 0 1 0 88.6 73.1 A38 38 0 0 1 49.5 8 Z"
			fill="#efe6c4"
			stroke="var(--ink)"
			stroke-width="2.5"
			stroke-linejoin="round"
		/>
		<circle cx="22" cy="58" r="5" fill="#ddd2ab" />
		<circle cx="34" cy="80" r="3.5" fill="#ddd2ab" />
		<circle cx="28" cy="32" r="3" fill="#ddd2ab" />
	</svg>
</div>

<style>
	/* Keyed on <html data-sky>, which switches before the theme: the outgoing one
	   leaves first, the colours change (see $lib/sky.svelte), then the incoming one
	   arrives. Each state's transition is the one used when entering it. */
	.sun {
		transition: translate 1.2s cubic-bezier(0.2, 0.8, 0.3, 1) 1s;
	}
	.moon {
		translate: 0 -110%;
		transform-origin: 24% 0;
		transition: translate 0.9s cubic-bezier(0.5, 0, 0.75, 0);
	}
	:global(:root[data-sky='night'] [data-scene-root]:not([data-theme='light'])) .sun {
		translate: 0 380px;
		transition: translate 1.2s cubic-bezier(0.5, 0, 0.75, 0);
	}
	:global(:root[data-sky='night'] [data-scene-root]:not([data-theme='light'])) .moon {
		translate: 0 0;
		transition: translate 1.1s cubic-bezier(0.34, 1.4, 0.64, 1) 1.3s;
		animation: moon-sway 6s ease-in-out 2.4s infinite;
	}
	/* While dragged or swinging, the string physics moves the moon instead. */
	:global(:root[data-sky='night'] [data-scene-root]:not([data-theme='light'])) .moon.loose {
		animation: none;
	}

	/* Starts and ends upright, so the sway picks up from the resting moon without a jump. */
	@keyframes moon-sway {
		0%,
		100% {
			rotate: 0deg;
		}
		25% {
			rotate: 1.5deg;
		}
		75% {
			rotate: -1.5deg;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.sun,
		.moon {
			transition: none;
			animation: none;
		}
	}
</style>

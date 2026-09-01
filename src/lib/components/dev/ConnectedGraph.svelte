<script lang="ts">
	import { onMount } from 'svelte';
	import XIcon from 'phosphor-svelte/lib/XIcon';
	import LockKeyIcon from 'phosphor-svelte/lib/LockKeyIcon';
	import MagnifyingGlassIcon from 'phosphor-svelte/lib/MagnifyingGlassIcon';
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';

	let {
		class: className = '',
		color = '255,255,255',
		nodeCount = 90,
		neighbors = 4,
		spacing = 0.035,
		jitter = 0.05,
		autoSpeed = 0.0016
	}: {
		class?: string;
		color?: string;
		nodeCount?: number;
		neighbors?: number;
		spacing?: number;
		jitter?: number;
		autoSpeed?: number;
	} = $props();

	let canvas: HTMLCanvasElement;

	// Selected node index drives the data card (component-level so the markup reacts).
	let selected = $state<number | null>(null);
	// Card top-left in canvas CSS px, kept near the selected node and clamped on-screen.
	let cardX = $state(0);
	let cardY = $state(0);
	let wake: (() => void) | null = null;

	type Vec3 = { x: number; y: number; z: number };
	type Point = {
		x: number;
		y: number;
		z: number;
		node: boolean;
		b: number;
		ni: number;
		// Edge membership for data pulses: ei = edge index, t = position along edge (0..1).
		ei: number;
		t: number;
	};

	// --- deterministic mock "user record" per node, to showcase the linked data graph ---
	const FIRST = ['Mara', 'Tomas', 'Aisha', 'Liam', 'Noor', 'Felix', 'Sofia', 'Jonas', 'Amara', 'Eli', 'Yuki', 'Cara'];
	const LAST = ['Holt', 'Vance', 'Okafor', 'Reyes', 'Lindqvist', 'Mbeki', 'Sato', 'Novak', 'Haddad', 'Frost'];
	const CITY = ['Berlin', 'Lisbon', 'Nairobi', 'Osaka', 'Toronto', 'Oslo', 'Bogotá', 'Accra'];
	const DOMAIN = ['fastmail.com', 'proton.me', 'hey.com', 'gmail.com'];

	function lcg(seed: number) {
		let s = (seed >>> 0) || 1;
		return () => {
			s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
			return s / 4294967296;
		};
	}
	const pick = <T>(arr: T[], r: () => number) => arr[Math.floor(r() * arr.length)];

	type Profile = {
		name: string;
		email: string;
		id: string;
		city: string;
		initials: string;
		links: { label: string; value: string; kind: 'encrypted' | 'queryable'; href: string }[];
	};

	function profileFor(index: number): Profile {
		const r = lcg(Math.imul(index + 1, 2654435761));
		const first = pick(FIRST, r);
		const last = pick(LAST, r);
		const city = pick(CITY, r);
		const domain = pick(DOMAIN, r);
		const i = (n: number) => Math.floor(r() * n);
		return {
			name: `${first} ${last}`,
			email: `${first}.${last}`.toLowerCase() + '@' + domain,
			id: 'usr_' + (Math.imul(index + 1, 2654435761) >>> 0).toString(16).slice(0, 6),
			city,
			initials: (first[0] + last[0]).toUpperCase(),
			links: [
				{ label: 'Contacts', value: `${40 + i(260)}`, kind: 'queryable', href: '/docs/neoworks/openschema/contacts' },
				{ label: 'Calendar', value: `${5 + i(55)} events`, kind: 'queryable', href: '/docs/neoworks/openschema/events' },
				{ label: 'Tasks', value: `${i(40)}`, kind: 'queryable', href: '/docs/neoworks/openschema/tasks' },
				{ label: 'Files', value: `${20 + i(400)} · ${(0.2 + r() * 6).toFixed(1)} GB`, kind: 'encrypted', href: '/docs/neoworks/storage' },
				{ label: 'Photos', value: `${i(2000)}`, kind: 'encrypted', href: '/docs/neoworks/storage' },
				{ label: 'Devices', value: `${1 + i(4)}`, kind: 'queryable', href: '/docs/neoworks/devices' }
			]
		};
	}

	function buildNodes(n: number): Vec3[] {
		const nodes: Vec3[] = [];
		while (nodes.length < n) {
			const x = Math.random() * 2 - 1;
			const y = Math.random() * 2 - 1;
			const z = Math.random() * 2 - 1;
			if (x * x + y * y + z * z <= 1) nodes.push({ x, y, z });
		}
		return nodes;
	}

	function buildEdges(nodes: Vec3[], k: number): [number, number][] {
		const seen = new Set<string>();
		const edges: [number, number][] = [];
		for (let i = 0; i < nodes.length; i++) {
			const dists: { j: number; d: number }[] = [];
			for (let j = 0; j < nodes.length; j++) {
				if (j === i) continue;
				const dx = nodes[i].x - nodes[j].x;
				const dy = nodes[i].y - nodes[j].y;
				const dz = nodes[i].z - nodes[j].z;
				dists.push({ j, d: dx * dx + dy * dy + dz * dz });
			}
			dists.sort((a, b) => a.d - b.d);
			for (let m = 0; m < k; m++) {
				const j = dists[m].j;
				const key = i < j ? `${i}-${j}` : `${j}-${i}`;
				if (seen.has(key)) continue;
				seen.add(key);
				edges.push([i, j]);
			}
		}
		return edges;
	}

	function bakePoints(): { points: Point[]; edgeCount: number } {
		const nodes = buildNodes(nodeCount);
		const edges = buildEdges(nodes, neighbors);
		const points: Point[] = [];

		for (let i = 0; i < nodes.length; i++) {
			points.push({ x: nodes[i].x, y: nodes[i].y, z: nodes[i].z, node: true, b: 1, ni: i, ei: -1, t: 0 });
		}

		for (let ei = 0; ei < edges.length; ei++) {
			const [a, b] = edges[ei];
			const A = nodes[a];
			const B = nodes[b];
			const dx = B.x - A.x;
			const dy = B.y - A.y;
			const dz = B.z - A.z;
			const len = Math.hypot(dx, dy, dz);
			const count = Math.max(2, Math.round(len / spacing));
			for (let s = 1; s < count; s++) {
				const t = s / count + (Math.random() * 2 - 1) * (0.4 / count);
				points.push({
					x: A.x + dx * t + (Math.random() * 2 - 1) * jitter,
					y: A.y + dy * t + (Math.random() * 2 - 1) * jitter,
					z: A.z + dz * t + (Math.random() * 2 - 1) * jitter,
					node: false,
					b: 0.35 + Math.random() * 0.65,
					ni: -1,
					ei,
					t
				});
			}
		}
		return { points, edgeCount: edges.length };
	}

	onMount(() => {
		const ctx = canvas.getContext('2d')!;
		const { points, edgeCount } = bakePoints();

		// A "transfer" flashes an entire edge's dot cloud bright at once, then fades.
		type Flash = { ei: number; start: number };
		let flashes: Flash[] = [];
		const maxFlashes = 7;
		const flashDuration = 400; // ms lit
		const flashFade = 0.35; // last fraction of life spent fading out
		let frameTime = 0;

		function spawnFlash(now: number) {
			if (flashes.length >= maxFlashes || edgeCount === 0) return;
			flashes.push({ ei: Math.floor(Math.random() * edgeCount), start: now });
		}

		// Brightness 0..1 for a flash given its age; full, then linear fade at the tail.
		function flashIntensity(age: number): number {
			if (age >= flashDuration) return 0;
			const holdUntil = flashDuration * (1 - flashFade);
			if (age <= holdUntil) return 1;
			return 1 - (age - holdUntil) / (flashDuration * flashFade);
		}

		let dpr = 1;
		let w = 0,
			h = 0;

		let yaw = 0.4;
		const pitch = -0.25;

		let raf = 0;
		let running = false;
		let visible = true;

		// Screen positions of nodes for click hit-testing (CSS px), refreshed each draw.
		const nodeScreen: { x: number; y: number; ni: number }[] = [];

		function resize() {
			dpr = Math.min(window.devicePixelRatio || 1, 2);
			w = canvas.clientWidth;
			h = canvas.clientHeight;
			canvas.width = w * dpr;
			canvas.height = h * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			request();
		}

		// Place the card next to the node, flipping/clamping to stay inside the canvas.
		function positionCard(nodeX: number, nodeY: number) {
			const cardW = 244;
			const cardH = 264;
			const pad = 10;
			const gap = 16;
			let left = nodeX + gap;
			if (left + cardW > w - pad) left = nodeX - gap - cardW;
			let top = nodeY - cardH / 2;
			cardX = Math.max(pad, Math.min(left, w - cardW - pad));
			cardY = Math.max(pad, Math.min(top, h - cardH - pad));
		}

		function draw() {
			const cx = w / 2;
			const cy = h / 2;
			const radius = Math.min(w, h) * 0.34;
			const focal = 3;

			const cosY = Math.cos(yaw),
				sinY = Math.sin(yaw);
			const cosX = Math.cos(pitch),
				sinX = Math.sin(pitch);

			ctx.clearRect(0, 0, w, h);
			ctx.fillStyle = `rgb(${color})`;
			nodeScreen.length = 0;

			// Intensity per actively-flashing edge, so every dot on it lights up together.
			const edgeGlow = new Map<number, number>();
			for (const flash of flashes) {
				const intensity = flashIntensity(frameTime - flash.start);
				if (intensity <= 0) continue;
				const prev = edgeGlow.get(flash.ei) || 0;
				if (intensity > prev) edgeGlow.set(flash.ei, intensity);
			}

			let selX = 0,
				selY = 0,
				hasSel = false;

			for (const p of points) {
				const x1 = p.x * cosY + p.z * sinY;
				const z1 = -p.x * sinY + p.z * cosY;
				const y2 = p.y * cosX - z1 * sinX;
				const z2 = p.y * sinX + z1 * cosX;
				const persp = focal / (focal - z2);
				const sx = cx + x1 * persp * radius;
				const sy = cy + y2 * persp * radius;
				const depth = (z2 + 1) / 2;

				let size = p.node ? 1.5 + depth * 1.7 : 0.6 + depth * 0.9;
				let alpha = p.b * (p.node ? 0.55 + depth * 0.45 : 0.08 + depth * 0.42);

				// Light up every dot on a flashing edge at once.
				if (!p.node) {
					const glow = edgeGlow.get(p.ei);
					if (glow) {
						alpha = alpha + glow * (1 - alpha);
						size += glow * 1.8;
					}
				}

				ctx.globalAlpha = alpha;
				ctx.fillRect(sx - size / 2, sy - size / 2, size, size);

				if (p.node) {
					nodeScreen.push({ x: sx, y: sy, ni: p.ni });
					if (p.ni === selected) {
						selX = sx;
						selY = sy;
						hasSel = true;
					}
				}
			}

			// Highlight ring on the selected node + place the data card beside it.
			if (hasSel) {
				ctx.globalAlpha = 1;
				ctx.fillRect(selX - 2, selY - 2, 4, 4);
				ctx.strokeStyle = `rgb(${color})`;
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.arc(selX, selY, 9, 0, Math.PI * 2);
				ctx.stroke();
				positionCard(selX, selY);
			}

			ctx.globalAlpha = 1;
		}

		/** The graph holds still while a node is selected, so its card stays put. */
		function spinRate(): number {
			if (selected !== null) return 0;
			return autoSpeed;
		}

		function frame(now: number) {
			frameTime = now;
			flashes = flashes.filter((flash) => now - flash.start < flashDuration);

			const spin = spinRate();
			yaw += spin;
			draw();

			if (visible && (spin !== 0 || flashes.length > 0)) {
				raf = requestAnimationFrame(frame);
			} else {
				running = false;
			}
		}

		function request() {
			if (running || !visible) return;
			running = true;
			raf = requestAnimationFrame(frame);
		}
		wake = request;

		/** Nearest node within a 14px radius of the pointer, or null. */
		function nearestNode(event: MouseEvent): { x: number; y: number; ni: number } | null {
			const rect = canvas.getBoundingClientRect();
			const px = event.clientX - rect.left;
			const py = event.clientY - rect.top;
			let best: { x: number; y: number; ni: number } | null = null;
			let bestDistance = 14 * 14;
			for (const node of nodeScreen) {
				const distance = (node.x - px) ** 2 + (node.y - py) ** 2;
				if (distance >= bestDistance) continue;
				bestDistance = distance;
				best = node;
			}
			return best;
		}

		// A click selects the nearest node, or clears the selection.
		function onClick(event: MouseEvent) {
			const node = nearestNode(event);
			if (!node) {
				selected = null;
				request();
				return;
			}
			selected = node.ni;
			positionCard(node.x, node.y);
			request();
		}

		const ro = new ResizeObserver(resize);
		ro.observe(canvas);
		resize();

		const io = new IntersectionObserver(
			([entry]) => {
				visible = entry.isIntersecting && !document.hidden;
				if (visible) request();
			},
			{ threshold: 0.01 }
		);
		io.observe(canvas);

		// Occasionally flash an edge and wake the loop to animate the fade.
		const pulseTimer = setInterval(() => {
			if (!visible) return;
			if (Math.random() < 0.8) {
				spawnFlash(performance.now());
				request();
			}
		}, 500);

		const onVisibility = () => {
			visible = !document.hidden && canvas.getBoundingClientRect().bottom > 0;
			if (visible) request();
		};
		document.addEventListener('visibilitychange', onVisibility);

		canvas.addEventListener('click', onClick);

		return () => {
			cancelAnimationFrame(raf);
			clearInterval(pulseTimer);
			ro.disconnect();
			io.disconnect();
			document.removeEventListener('visibilitychange', onVisibility);
			canvas.removeEventListener('click', onClick);
			wake = null;
		};
	});

	function closeCard() {
		selected = null;
		wake?.();
	}
</script>

<div class="relative h-full w-full {className}">
	<canvas
		bind:this={canvas}
		class="block h-full w-full select-none"
	></canvas>

	{#if selected !== null}
		{@const p = profileFor(selected)}
		<div
			style="left: {cardX}px; top: {cardY}px;"
			class="absolute w-[244px] overflow-hidden rounded-xl border border-line bg-elevated/90 shadow-[var(--shadow-overlay)] backdrop-blur-xl"
		>
			<div class="flex items-center gap-2.5 border-b border-line-faint p-3">
				<div
					class="flex size-9 shrink-0 items-center justify-center rounded-full border border-line-faint bg-raised text-[11px] font-semibold text-muted"
				>
					{p.initials}
				</div>
				<div class="min-w-0 flex-1">
					<p class="truncate text-[13px] font-semibold text-default">{p.name}</p>
					<p class="truncate text-2xs text-dim">{p.email}</p>
				</div>
				<button
					type="button"
					onclick={closeCard}
					aria-label="Close"
					class="flex size-6 shrink-0 items-center justify-center rounded-md text-dim transition-colors hover:bg-hover hover:text-default"
				>
					<XIcon size={14} />
				</button>
			</div>

			<div class="flex items-center justify-between px-3 py-1.5 font-mono text-[10px] text-faint">
				<span>{p.id}</span>
				<span>{p.city}</span>
			</div>

			<ul class="flex flex-col px-2 pb-2">
				{#each p.links as link}
					<li>
						<a
							href={link.href}
							class="group flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors hover:bg-hover"
						>
							<span class="flex size-4 shrink-0 items-center justify-center text-dim">
								{#if link.kind === 'encrypted'}
									<LockKeyIcon size={12} />
								{:else}
									<MagnifyingGlassIcon size={12} />
								{/if}
							</span>
							<span class="flex-1 text-xs text-muted group-hover:text-default">{link.label}</span>
							<span class="font-mono text-[11px] text-default group-hover:hidden">{link.value}</span>
							<span class="hidden items-center gap-0.5 text-2xs text-dim group-hover:flex">
								Docs
								<CaretRightIcon size={11} weight="bold" />
							</span>
						</a>
					</li>
				{/each}
			</ul>

			<p class="border-t border-line-faint px-3 py-2 text-2xs text-dim">
				<span class="text-muted">Linked to this account</span> · accessed via scoped grants
			</p>
		</div>
	{/if}
</div>

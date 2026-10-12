/**
 * The moon as a point mass on an elastic string: slack when closer to the anchor than
 * the string's length, a stiff spring beyond it. Units are pixels and seconds.
 */
export type Point = { x: number; y: number };
export type MoonBody = { position: Point; velocity: Point };

const gravity = 2400;
const stiffness = 90;
const damping = 1.6;
const longestStepSeconds = 1 / 120;
/** Above this the crescent has left the top of the sky entirely. */
const flungOutHeight = -80;

/** The spring is shortened by its own sag under gravity, so the moon comes to rest at exactly `stringLength`. */
function unstretchedLength(stringLength: number): number {
	return stringLength - gravity / stiffness;
}

function stringPull(distance: number, stringLength: number): number {
	const stretch = distance - unstretchedLength(stringLength);
	if (stretch <= 0) return 0;
	return stiffness * stretch;
}

function step(body: MoonBody, anchor: Point, stringLength: number, seconds: number): MoonBody {
	const offsetX = body.position.x - anchor.x;
	const offsetY = body.position.y - anchor.y;
	const distance = Math.hypot(offsetX, offsetY);

	let accelerationX = 0;
	let accelerationY = gravity;
	if (distance > 0) {
		const pull = stringPull(distance, stringLength);
		accelerationX -= (pull * offsetX) / distance;
		accelerationY -= (pull * offsetY) / distance;
	}

	const remaining = Math.exp(-damping * seconds);
	const velocity = {
		x: (body.velocity.x + accelerationX * seconds) * remaining,
		y: (body.velocity.y + accelerationY * seconds) * remaining
	};
	const position = {
		x: body.position.x + velocity.x * seconds,
		y: body.position.y + velocity.y * seconds
	};
	return { position, velocity };
}

/** Advances the moon by `seconds`, in small fixed steps so a slow frame cannot make the spring explode. */
export function advanceMoon(body: MoonBody, anchor: Point, stringLength: number, seconds: number): MoonBody {
	let current = body;
	let left = seconds;
	while (left > 0) {
		const stepSeconds = Math.min(left, longestStepSeconds);
		current = step(current, anchor, stringLength, stepSeconds);
		left -= stepSeconds;
	}
	return current;
}

/** Thrown hard enough, the string goes slack and the moon flies out over the top. */
export function isFlungOut(body: MoonBody): boolean {
	return body.position.y < flungOutHeight;
}

export function restingPosition(anchor: Point, stringLength: number): Point {
	return { x: anchor.x, y: anchor.y + stringLength };
}

export function isSettled(body: MoonBody, anchor: Point, stringLength: number): boolean {
	const rest = restingPosition(anchor, stringLength);
	const distanceFromRest = Math.hypot(body.position.x - rest.x, body.position.y - rest.y);
	const speed = Math.hypot(body.velocity.x, body.velocity.y);
	return distanceFromRest < 0.5 && speed < 4;
}

/** A straight line while taut, sagging into a curve while the moon is closer than the string is long. */
export function stringPath(anchor: Point, moon: Point, stringLength: number): string {
	const distance = Math.hypot(moon.x - anchor.x, moon.y - anchor.y);
	const start = `M ${anchor.x} ${anchor.y}`;
	if (distance >= stringLength) return `${start} L ${moon.x} ${moon.y}`;

	const sag = Math.sqrt(stringLength * stringLength - distance * distance) * 0.6;
	const controlX = (anchor.x + moon.x) / 2;
	const controlY = (anchor.y + moon.y) / 2 + sag;
	return `${start} Q ${controlX} ${controlY} ${moon.x} ${moon.y}`;
}

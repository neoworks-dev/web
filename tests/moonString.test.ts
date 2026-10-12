import { describe, expect, test } from 'bun:test';
import {
	advanceMoon,
	isFlungOut,
	isSettled,
	restingPosition,
	stringPath
} from '../src/lib/components/landing/scrapbook/moonString';

const anchor = { x: 300, y: 0 };
const stringLength = 250;

describe('moon on a string', () => {
	test('hangs still at the end of its string', () => {
		const rest = restingPosition(anchor, stringLength);
		const body = advanceMoon({ position: rest, velocity: { x: 0, y: 0 } }, anchor, stringLength, 1);
		expect(body.position.x).toBeCloseTo(rest.x, 3);
		expect(body.position.y).toBeCloseTo(rest.y, 3);
	});

	test('swings back and settles after being pulled aside', () => {
		let body = { position: { x: 450, y: 200 }, velocity: { x: 0, y: 0 } };
		let crossedCentre = false;
		for (let frame = 0; frame < 60 * 8; frame += 1) {
			body = advanceMoon(body, anchor, stringLength, 1 / 60);
			if (body.position.x < anchor.x) crossedCentre = true;
		}
		expect(crossedCentre).toBe(true);
		expect(isSettled(body, anchor, stringLength)).toBe(true);
	});

	test('flies out over the top when flung upwards hard', () => {
		let body = { position: restingPosition(anchor, stringLength), velocity: { x: 0, y: -2400 } };
		let flungOut = false;
		for (let frame = 0; frame < 60 && !flungOut; frame += 1) {
			body = advanceMoon(body, anchor, stringLength, 1 / 60);
			flungOut = isFlungOut(body);
		}
		expect(flungOut).toBe(true);
	});

	test('stays in the sky after a gentle toss', () => {
		let body = { position: restingPosition(anchor, stringLength), velocity: { x: 0, y: -600 } };
		for (let frame = 0; frame < 120; frame += 1) {
			body = advanceMoon(body, anchor, stringLength, 1 / 60);
			expect(isFlungOut(body)).toBe(false);
		}
	});

	test('falls freely while the string is slack', () => {
		const body = advanceMoon({ position: { x: 300, y: 50 }, velocity: { x: 0, y: 0 } }, anchor, stringLength, 0.1);
		expect(body.velocity.x).toBe(0);
		expect(body.velocity.y).toBeGreaterThan(200);
	});
});

describe('string path', () => {
	test('is straight while taut', () => {
		expect(stringPath(anchor, { x: 300, y: 260 }, stringLength)).toBe('M 300 0 L 300 260');
	});

	test('sags into a curve while slack', () => {
		expect(stringPath(anchor, { x: 300, y: 100 }, stringLength)).toStartWith('M 300 0 Q ');
	});
});

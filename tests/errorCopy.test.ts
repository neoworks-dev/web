import { describe, expect, test } from 'bun:test';
import { copyForStatus } from '../src/lib/errorCopy';

describe('copyForStatus', () => {
	test('a missing page shows the lost hiker', () => {
		expect(copyForStatus(404, 'Not Found').pose).toBe('hiker');
	});

	test('unauthorised and forbidden show the guard', () => {
		expect(copyForStatus(401, undefined).pose).toBe('guard');
		expect(copyForStatus(403, undefined).pose).toBe('guard');
	});

	test('server errors show the sleeping marmot and hide the internal message', () => {
		const copy = copyForStatus(500, 'Internal Error');
		expect(copy.pose).toBe('sleeping');
		expect(copy.message).not.toContain('Internal Error');
	});

	test('other client errors show the error message when there is one', () => {
		expect(copyForStatus(400, 'Missing handle').message).toBe('Missing handle');
		expect(copyForStatus(400, undefined).message).toBe('Something about the request was off.');
		expect(copyForStatus(400, undefined).pose).toBe('reader');
	});
});

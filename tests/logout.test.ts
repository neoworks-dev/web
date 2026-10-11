import { describe, expect, it } from 'bun:test';

const { POST } = await import('../src/routes/auth/logout/+server');

describe('logout', () => {
	it('clears every token cookie, the refresh token included, and goes home', async () => {
		const deleted: string[] = [];
		const cookies = { delete: (name: string) => deleted.push(name) };

		let thrown: { status: number; location: string } | null = null;
		try {
			await POST({ cookies } as never);
		} catch (redirect) {
			thrown = redirect as { status: number; location: string };
		}

		expect(deleted).toContain('nw_access_token');
		expect(deleted).toContain('nw_refresh_token');
		expect(thrown).toMatchObject({ status: 303, location: '/' });
	});
});

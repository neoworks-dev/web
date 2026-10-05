import { describe, expect, it, mock } from 'bun:test';

const exchangedCodes: string[] = [];
mock.module('$lib/server/auth', () => ({
	PKCE_VERIFIER_COOKIE: 'nw_pkce_verifier',
	PKCE_STATE_COOKIE: 'nw_pkce_state',
	createServerAuth: () => ({
		exchangeCode: async (code: string) => {
			exchangedCodes.push(code);
		}
	})
}));

const { GET } = await import('../src/routes/auth/callback/+server');

function cookiesWith(values: Record<string, string>) {
	return {
		get: (name: string) => values[name],
		delete: () => {}
	};
}

async function callback(query: string, cookies: Record<string, string>) {
	const url = new URL(`https://neoworks.localhost/auth/callback?${query}`);
	try {
		await GET({ url, cookies: cookiesWith(cookies) } as never);
	} catch (thrown) {
		return thrown as { status: number; location?: string; body?: { message: string } };
	}
	throw new Error('callback returned without redirecting or failing');
}

const pkceCookies = { nw_pkce_verifier: 'verifier', nw_pkce_state: 'state-1' };

describe('auth callback', () => {
	it('shows an error the auth server reports instead of starting login again', async () => {
		const result = await callback('error=invalid_scope&error_description=Bad+scope&state=state-1', pkceCookies);
		expect(result.status).toBe(400);
		expect(result.body?.message).toBe('Bad scope');
		expect(result.location).toBeUndefined();
	});

	it('fails on a state mismatch instead of redirecting to login', async () => {
		const result = await callback('code=abc&state=other', pkceCookies);
		expect(result.status).toBe(400);
		expect(result.location).toBeUndefined();
	});

	it('exchanges the code and goes to the dashboard', async () => {
		const result = await callback('code=abc&state=state-1', pkceCookies);
		expect(result.status).toBe(302);
		expect(result.location).toBe('/dashboard');
		expect(exchangedCodes).toEqual(['abc']);
	});
});

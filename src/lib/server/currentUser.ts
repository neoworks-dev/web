import type { Cookies } from '@sveltejs/kit';
import { urls } from '$lib/urls';

type Fetch = typeof globalThis.fetch;

/**
 * The signed-in user, for layouts that render the public chrome. Non-fatal:
 * anonymous visitors simply get `null`.
 */
export async function currentUser(cookies: Cookies, fetch: Fetch) {
	const token = cookies.get('nw_access_token');
	if (!token) return null;

	const response = await fetch(`${urls.oauth}/oauth/userinfo`, {
		headers: { Authorization: `Bearer ${token}` }
	});
	if (!response.ok) return null;

	return await response.json();
}

import type { LayoutServerLoad } from './$types';
import { urls } from '$lib/urls';

// Surfaces the signed-in user (if any) to the public chrome so the header can show
// a profile menu. Non-fatal: anonymous visitors simply get `user: null`.
export const load: LayoutServerLoad = async ({ cookies, fetch }) => {
	const token = cookies.get('nw_access_token');
	if (!token) return { user: null };

	const response = await fetch(`${urls.oauth}/oauth/userinfo`, {
		headers: { Authorization: `Bearer ${token}` }
	});
	if (!response.ok) return { user: null };

	const user = await response.json();
	return { user };
};

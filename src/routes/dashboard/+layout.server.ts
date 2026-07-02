import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { urls } from '$lib/urls';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const token = cookies.get('nw_access_token');

	const response = await fetch(`${urls.oauth}/oauth/userinfo`, {
		headers: { Authorization: `Bearer ${token}` },
	});

  if (!response.ok) {
    return error(401, 'Unauthorized');
  }

	const user = await response.json();

	return { user };
};

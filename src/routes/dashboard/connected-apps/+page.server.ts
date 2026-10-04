import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { urls } from '$lib/urls';

export interface ConnectedInstall {
	id: string;
	clientId: string;
	name: string | null;
	createdAt: string;
	revokedAt: string | null;
}

function authorizationHeaders(accessToken: string | undefined): HeadersInit {
	return { Authorization: `Bearer ${accessToken}` };
}

export const load: PageServerLoad = async ({ cookies }) => {
	const response = await fetch(`${urls.api}/api/v1/installs`, {
		headers: authorizationHeaders(cookies.get('nw_access_token')),
	});
	if (!response.ok) {
		return error(response.status, 'Could not load connected apps');
	}
	const body = (await response.json()) as { installs: ConnectedInstall[] };
	return { installs: body.installs };
};

export const actions: Actions = {
	revoke: async ({ cookies, request }) => {
		const form = await request.formData();
		const installId = form.get('installId');
		if (typeof installId !== 'string' || installId === '') {
			return fail(400, { message: 'Missing app' });
		}
		const response = await fetch(`${urls.api}/api/v1/installs/${encodeURIComponent(installId)}`, {
			method: 'DELETE',
			headers: authorizationHeaders(cookies.get('nw_access_token')),
		});
		if (!response.ok) {
			return fail(response.status, { message: 'Could not revoke this app' });
		}
		return { revoked: installId };
	},
};

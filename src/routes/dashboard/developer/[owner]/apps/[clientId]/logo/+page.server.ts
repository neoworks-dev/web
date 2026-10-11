import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { attempt, createDeveloperSdk } from '$lib/server/developerSdk';

export const actions: Actions = {
	upload: async ({ cookies, request, params }) => {
		const logo = (await request.formData()).get('logo');
		if (!(logo instanceof File) || logo.size === 0) {
			return fail(400, { formName: 'upload', code: 'invalid_request', message: 'Choose a PNG or SVG file', field: 'logo' });
		}
		const outcome = await attempt('upload', () => createDeveloperSdk(cookies).apps.uploadLogo(params.clientId, logo));
		if (outcome.failure) {
			return outcome.failure;
		}
		return { uploaded: true };
	},
	remove: async ({ cookies, params }) => {
		const outcome = await attempt('remove', () => createDeveloperSdk(cookies).apps.deleteLogo(params.clientId));
		if (outcome.failure) {
			return outcome.failure;
		}
		return { removed: true };
	},
};

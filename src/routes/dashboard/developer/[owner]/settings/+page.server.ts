import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { attempt, createDeveloperSdk, formText } from '$lib/server/developerSdk';

export const actions: Actions = {
	rename: async ({ cookies, request, params }) => {
		const displayName = formText(await request.formData(), 'displayName');
		const outcome = await attempt('rename', () => createDeveloperSdk(cookies).organizations.update(params.owner, { displayName }));
		if (outcome.failure) {
			return outcome.failure;
		}
		return { renamed: true };
	},
	archive: async ({ cookies, params }) => {
		const outcome = await attempt('archive', () => createDeveloperSdk(cookies).organizations.archive(params.owner));
		if (outcome.failure) {
			return outcome.failure;
		}
		return redirect(303, '/dashboard/developer');
	},
};

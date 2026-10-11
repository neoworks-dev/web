import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { attempt, createDeveloperSdk, formText } from '$lib/server/developerSdk';

export const actions: Actions = {
	create: async ({ cookies, request }) => {
		const form = await request.formData();
		const args = { handle: formText(form, 'handle'), displayName: formText(form, 'displayName') };
		const outcome = await attempt('create', () => createDeveloperSdk(cookies).organizations.create(args));
		if (outcome.failure) {
			return outcome.failure;
		}
		return redirect(303, `/dashboard/developer/${outcome.result.handle}`);
	},
};

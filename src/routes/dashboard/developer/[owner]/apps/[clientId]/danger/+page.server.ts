import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { attempt, createDeveloperSdk } from '$lib/server/developerSdk';

export const actions: Actions = {
	delete: async ({ cookies, params }) => {
		const outcome = await attempt('delete', () => createDeveloperSdk(cookies).apps.delete(params.clientId));
		if (outcome.failure) {
			return outcome.failure;
		}
		return redirect(303, `/dashboard/developer/${params.owner}/apps`);
	},
};

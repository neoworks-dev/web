import type { Actions } from './$types';
import { attempt, createDeveloperSdk } from '$lib/server/developerSdk';

export const actions: Actions = {
	rotate: async ({ cookies, params }) => {
		const outcome = await attempt('rotate', () => createDeveloperSdk(cookies).apps.rotateSecret(params.clientId));
		if (outcome.failure) {
			return outcome.failure;
		}
		return { clientSecret: outcome.result };
	},
};

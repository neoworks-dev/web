import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { attempt, createDeveloperSdk, formText } from '$lib/server/developerSdk';

export const actions: Actions = {
	claim: async ({ cookies, request }) => {
		const handle = formText(await request.formData(), 'handle');
		const outcome = await attempt('claim', () => createDeveloperSdk(cookies).handles.claim(handle));
		if (outcome.failure) {
			return outcome.failure;
		}
		return redirect(303, `/dashboard/developer/${outcome.result}`);
	},
};

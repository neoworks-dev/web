import type { Actions } from './$types';
import { attempt, createDeveloperSdk, formText } from '$lib/server/developerSdk';

export const actions: Actions = {
	submit: async ({ cookies, request, params }) => {
		const form = await request.formData();
		const submission = { privacyPolicyUrl: formText(form, 'privacyPolicyUrl'), supportContact: formText(form, 'supportContact') };
		const outcome = await attempt('submit', () => createDeveloperSdk(cookies).apps.submitReview(params.clientId, submission));
		if (outcome.failure) {
			return outcome.failure;
		}
		return { submitted: true };
	},
};

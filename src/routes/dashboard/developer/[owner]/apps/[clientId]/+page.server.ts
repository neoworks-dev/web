import type { Actions, PageServerLoad } from './$types';
import { attempt, createDeveloperSdk, orFail } from '$lib/server/developerSdk';
import { appFieldsFromForm } from '$lib/server/appFormData';

export const load: PageServerLoad = async ({ cookies }) => {
	const schemas = await orFail(createDeveloperSdk(cookies).schemas.list());
	return { schemas };
};

export const actions: Actions = {
	save: async ({ cookies, request, params }) => {
		const fields = appFieldsFromForm(await request.formData());
		const outcome = await attempt('save', () => createDeveloperSdk(cookies).apps.update(params.clientId, fields));
		if (outcome.failure) {
			return outcome.failure;
		}
		return { saved: true };
	},
};

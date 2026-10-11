import type { AppType } from '@neoworks-dev/platform';
import type { Actions, PageServerLoad } from './$types';
import { attempt, createDeveloperSdk, formText, orFail } from '$lib/server/developerSdk';
import { appFieldsFromForm } from '$lib/server/appFormData';

export const load: PageServerLoad = async ({ cookies }) => {
	const schemas = await orFail(createDeveloperSdk(cookies).schemas.list());
	return { schemas };
};

export const actions: Actions = {
	create: async ({ cookies, request, params }) => {
		const form = await request.formData();
		const type = formText(form, 'type') as AppType;
		const args = { ...appFieldsFromForm(form), type };
		const outcome = await attempt('create', () => createDeveloperSdk(cookies).apps.create(params.owner, args));
		if (outcome.failure) {
			return outcome.failure;
		}
		const { app, clientSecret } = outcome.result;
		return { created: { clientId: app.id, name: app.name, type: app.type, clientSecret } };
	},
};

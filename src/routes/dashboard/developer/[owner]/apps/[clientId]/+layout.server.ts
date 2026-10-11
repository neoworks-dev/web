import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { createDeveloperSdk, orFail } from '$lib/server/developerSdk';

export const load: LayoutServerLoad = async ({ cookies, params }) => {
	const app = await orFail(createDeveloperSdk(cookies).apps.get(params.clientId));
	if (app.owner.handle !== params.owner) {
		return error(404, 'This app belongs to another owner');
	}
	return { app };
};

import type { PageServerLoad } from './$types';
import { createDeveloperSdk, orFail } from '$lib/server/developerSdk';

export const load: PageServerLoad = async ({ cookies, params, parent }) => {
	const { app } = await parent();
	if (!app.myPermissions.includes('usage.view')) {
		return { usage: null };
	}
	const usage = await orFail(createDeveloperSdk(cookies).apps.usage(params.clientId, 30));
	return { usage };
};

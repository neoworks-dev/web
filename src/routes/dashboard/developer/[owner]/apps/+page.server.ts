import type { PageServerLoad } from './$types';
import { createDeveloperSdk, orFail } from '$lib/server/developerSdk';

export const load: PageServerLoad = async ({ cookies, params }) => {
	const apps = await orFail(createDeveloperSdk(cookies).apps.listForOwner(params.owner));
	return { apps };
};

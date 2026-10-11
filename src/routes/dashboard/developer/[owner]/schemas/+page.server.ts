import type { PageServerLoad } from './$types';
import { createDeveloperSdk, orFail } from '$lib/server/developerSdk';
import { loadSchemaHistories } from '$lib/server/overview';
import { appUrl } from '$lib/urls';

export const load: PageServerLoad = async ({ cookies, params }) => {
	const sdk = createDeveloperSdk(cookies);
	const schemas = await orFail(sdk.schemas.list({ scope: params.owner }));
	const histories = await orFail(loadSchemaHistories(sdk, schemas));
	return { histories, openschemaUrl: appUrl('openschema') };
};

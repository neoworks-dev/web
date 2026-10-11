import type { PageServerLoad } from './$types';
import { createDeveloperSdk, orFail } from '$lib/server/developerSdk';
import { appUrl } from '$lib/urls';

export const load: PageServerLoad = async ({ cookies, params }) => {
	const sdk = createDeveloperSdk(cookies);
	const schemas = await orFail(sdk.schemas.list({ scope: params.owner }));
	const histories = await orFail(
		Promise.all(schemas.map(async (schema) => ({ schema, publishes: await sdk.schemas.publishes(schema.scope, schema.name) }))),
	);
	return { histories, openschemaUrl: appUrl('openschema') };
};

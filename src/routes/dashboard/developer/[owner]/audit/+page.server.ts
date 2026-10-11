import type { PageServerLoad } from './$types';
import { createDeveloperSdk, orFail } from '$lib/server/developerSdk';
import { holdsPermission } from '$lib/developer/permissions';

export const load: PageServerLoad = async ({ parent, cookies, params, url }) => {
	const { organization, grants } = await parent();
	if (organization === null || !holdsPermission(grants, 'audit.view')) {
		return { page: null };
	}
	const before = url.searchParams.get('before');
	const query = { limit: 25, before: cursorOrUndefined(before) };
	const page = await orFail(createDeveloperSdk(cookies).organizations.audit(params.owner, query));
	return { page };
};

function cursorOrUndefined(cursor: string | null): string | undefined {
	if (cursor === null || cursor === '') {
		return undefined;
	}
	return cursor;
}

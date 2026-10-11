import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { createDeveloperSdk, orFail } from '$lib/server/developerSdk';

export const load: LayoutServerLoad = async ({ parent, params, cookies }) => {
	const { developer } = await parent();
	const entry = developer?.owners.find((candidate) => candidate.owner.handle === params.owner);
	if (entry === undefined) {
		return error(404, `You do not act for ${params.owner}`);
	}
	if (entry.owner.kind === 'user') {
		return { owner: entry.owner, grants: entry.grants, organization: null };
	}
	const organization = await orFail(createDeveloperSdk(cookies).organizations.get(params.owner));
	return { owner: entry.owner, grants: organization.myGrants, organization };
};

import type { PageServerLoad } from './$types';
import { createDeveloperSdk, orFail } from '$lib/server/developerSdk';
import { countMembers, countSentInvitations, loadOwnerOverview, loadRejectedPublishes } from '$lib/server/overview';
import { buildTodos } from '$lib/developer/todos';

export const load: PageServerLoad = async ({ parent, cookies, params }) => {
	const { organization, grants } = await parent();
	const sdk = createDeveloperSdk(cookies);
	const isOrganization = organization !== null;
	const overview = await orFail(loadOwnerOverview(sdk, params.owner));
	const [rejectedPublishes, memberCount, sentInvitationCount, received] = await orFail(
		Promise.all([
			loadRejectedPublishes(sdk, overview.schemas),
			countMembers(sdk, params.owner, isOrganization),
			countSentInvitations(sdk, params.owner, isOrganization, grants),
			sdk.invitations.list(),
		]),
	);
	const todos = buildTodos({
		ownerHandle: params.owner,
		receivedInvitationCount: received.length,
		sentInvitationCount,
		apps: overview.apps,
		domains: overview.domains,
		rejectedPublishes,
	});
	return { apps: overview.apps, schemaCount: overview.schemas.length, memberCount, todos };
};

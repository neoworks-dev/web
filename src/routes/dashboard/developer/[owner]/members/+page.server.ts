import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { Grant } from '@neoworks-dev/sdk';
import { attempt, createDeveloperSdk, formText, orFail } from '$lib/server/developerSdk';
import { holdsPermission } from '$lib/developer/permissions';

export const load: PageServerLoad = async ({ parent, cookies, params }) => {
	const { organization, grants } = await parent();
	if (organization === null) {
		return { members: [], invitations: [], apps: [] };
	}
	const sdk = createDeveloperSdk(cookies);
	const canManage = holdsPermission(grants, 'members.manage');
	const [members, summaries] = await orFail(Promise.all([sdk.organizations.members(params.owner), sdk.apps.listForOwner(params.owner)]));
	const invitations = await orFail(loadInvitations(canManage, () => sdk.organizations.invitations(params.owner)));
	return { members, invitations, apps: summaries.map((app) => ({ id: app.id, name: app.name })) };
};

async function loadInvitations<Invitation>(canManage: boolean, load: () => Promise<Invitation[]>): Promise<Invitation[]> {
	if (!canManage) {
		return [];
	}
	return load();
}

function parseGrantsField(raw: string): Grant[] {
	try {
		return JSON.parse(raw) as Grant[];
	} catch {
		return [];
	}
}

function textOrUndefined(text: string): string | undefined {
	if (text === '') {
		return undefined;
	}
	return text;
}

export const actions: Actions = {
	setGrants: async ({ cookies, request, params }) => {
		const form = await request.formData();
		const userId = formText(form, 'userId');
		const grants = parseGrantsField(formText(form, 'grants'));
		const outcome = await attempt(`grants-${userId}`, () =>
			createDeveloperSdk(cookies).organizations.setMemberGrants(params.owner, userId, grants),
		);
		if (outcome.failure) {
			return outcome.failure;
		}
		return { updated: userId };
	},
	remove: async ({ cookies, request, params }) => {
		const userId = formText(await request.formData(), 'userId');
		const outcome = await attempt(`remove-${userId}`, () =>
			createDeveloperSdk(cookies).organizations.removeMember(params.owner, userId),
		);
		if (outcome.failure) {
			return outcome.failure;
		}
		return { removed: userId };
	},
	leave: async ({ cookies, request, params }) => {
		const userId = formText(await request.formData(), 'userId');
		const outcome = await attempt('leave', () => createDeveloperSdk(cookies).organizations.removeMember(params.owner, userId));
		if (outcome.failure) {
			return outcome.failure;
		}
		return redirect(303, '/dashboard/developer');
	},
	invite: async ({ cookies, request, params }) => {
		const form = await request.formData();
		const email = formText(form, 'email');
		const contactCode = formText(form, 'contactCode');
		const args = {
			grants: parseGrantsField(formText(form, 'grants')),
			email: textOrUndefined(email),
			contactCode: textOrUndefined(contactCode),
		};
		const outcome = await attempt('invite', () => createDeveloperSdk(cookies).organizations.invite(params.owner, args));
		if (outcome.failure) {
			return outcome.failure;
		}
		return { invited: outcome.result.id };
	},
	revokeInvitation: async ({ cookies, request, params }) => {
		const invitationId = formText(await request.formData(), 'invitationId');
		const outcome = await attempt('revoke', () =>
			createDeveloperSdk(cookies).organizations.revokeInvitation(params.owner, invitationId),
		);
		if (outcome.failure) {
			return outcome.failure;
		}
		return { revoked: invitationId };
	},
};

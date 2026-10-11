import type { Actions, PageServerLoad } from './$types';
import { attempt, createDeveloperSdk, formText, orFail } from '$lib/server/developerSdk';

export const load: PageServerLoad = async ({ cookies }) => {
	const invitations = await orFail(createDeveloperSdk(cookies).invitations.list());
	return { invitations };
};

export const actions: Actions = {
	accept: async ({ cookies, request }) => {
		const invitationId = formText(await request.formData(), 'invitationId');
		const outcome = await attempt('invitation', () => createDeveloperSdk(cookies).invitations.accept(invitationId));
		if (outcome.failure) {
			return outcome.failure;
		}
		return { accepted: invitationId };
	},
	decline: async ({ cookies, request }) => {
		const invitationId = formText(await request.formData(), 'invitationId');
		const outcome = await attempt('invitation', () => createDeveloperSdk(cookies).invitations.decline(invitationId));
		if (outcome.failure) {
			return outcome.failure;
		}
		return { declined: invitationId };
	},
};

import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { attempt, createDeveloperSdk, formText, orFail } from '$lib/server/developerSdk';

const BYTES_PER_MEGABYTE = 1024 * 1024;

export const load: PageServerLoad = async ({ cookies }) => {
	const sdk = createDeveloperSdk(cookies);
	const [apps, storage] = await Promise.all([orFail(sdk.connectedApps.list()), orFail(sdk.storage.usage())]);
	return { apps, storage };
};

/** The cap field is in megabytes; empty removes the cap. */
function capBytesOf(text: string): number | null | undefined {
	if (text === '') {
		return null;
	}
	const megabytes = Number(text);
	if (!Number.isFinite(megabytes) || megabytes < 0) {
		return undefined;
	}
	return Math.round(megabytes * BYTES_PER_MEGABYTE);
}

export const actions: Actions = {
	revoke: async ({ cookies, request }) => {
		const installId = formText(await request.formData(), 'installId');
		if (installId === '') {
			return fail(400, { formName: 'revoke', code: 'invalid_request', message: 'Missing app' });
		}
		const outcome = await attempt('revoke', () => createDeveloperSdk(cookies).installs.revoke(installId));
		if (outcome.failure) {
			return outcome.failure;
		}
		return { revoked: installId };
	},
	cap: async ({ cookies, request }) => {
		const form = await request.formData();
		const clientId = formText(form, 'clientId');
		const capBytes = capBytesOf(formText(form, 'capMegabytes'));
		if (capBytes === undefined) {
			return fail(400, { formName: `cap-${clientId}`, code: 'invalid_request', message: 'Enter a number of megabytes, or leave it empty for no cap', field: 'capMegabytes' });
		}
		const outcome = await attempt(`cap-${clientId}`, () => createDeveloperSdk(cookies).storage.setAppCap(clientId, capBytes));
		if (outcome.failure) {
			return outcome.failure;
		}
		return { capped: clientId };
	},
};

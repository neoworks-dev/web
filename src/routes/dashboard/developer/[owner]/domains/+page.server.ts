import type { Actions, PageServerLoad } from './$types';
import type { VerificationMethod } from '@neoworks-dev/platform';
import { attempt, createDeveloperSdk, formText, orFail } from '$lib/server/developerSdk';

export const load: PageServerLoad = async ({ cookies, params }) => {
	const domains = await orFail(createDeveloperSdk(cookies).domains.list(params.owner));
	return { domains };
};

export const actions: Actions = {
	add: async ({ cookies, request, params }) => {
		const form = await request.formData();
		const args = { domain: formText(form, 'domain'), method: formText(form, 'method') as VerificationMethod };
		const outcome = await attempt('add', () => createDeveloperSdk(cookies).domains.add(params.owner, args));
		if (outcome.failure) {
			return outcome.failure;
		}
		return { added: outcome.result.domain };
	},
	verify: async ({ cookies, request, params }) => {
		const domain = formText(await request.formData(), 'domain');
		const outcome = await attempt(`verify-${domain}`, () => createDeveloperSdk(cookies).domains.verify(params.owner, domain));
		if (outcome.failure) {
			return outcome.failure;
		}
		return { verified: outcome.result.domain, passed: outcome.result.verified };
	},
	remove: async ({ cookies, request, params }) => {
		const domain = formText(await request.formData(), 'domain');
		const outcome = await attempt(`remove-${domain}`, () => createDeveloperSdk(cookies).domains.remove(params.owner, domain));
		if (outcome.failure) {
			return outcome.failure;
		}
		return { removed: domain };
	},
};

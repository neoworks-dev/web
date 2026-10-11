import type { ReviewDecision, ReviewStatus } from '@neoworks-dev/sdk';
import type { Actions, PageServerLoad } from './$types';
import { attempt, createDeveloperSdk, formText, orFail } from '$lib/server/developerSdk';

const STATUSES: ReviewStatus[] = ['pending', 'approved', 'rejected', 'suspended'];

function statusOf(value: string | null): ReviewStatus {
	const known = STATUSES.find((status) => status === value);
	if (known === undefined) {
		return 'pending';
	}
	return known;
}

export const load: PageServerLoad = async ({ cookies, url }) => {
	const status = statusOf(url.searchParams.get('status'));
	const items = await orFail(createDeveloperSdk(cookies).admin.reviews(status));
	return { status, statuses: STATUSES, items };
};

/** An empty field returns the client to the multiplier its standing earns. */
function multiplierOf(text: string): number | null {
	if (text === '') {
		return null;
	}
	return Number(text);
}

function decisionAction(decision: ReviewDecision) {
	return async ({ cookies, request }: { cookies: Parameters<typeof createDeveloperSdk>[0]; request: Request }) => {
		const form = await request.formData();
		const clientId = formText(form, 'clientId');
		const outcome = await attempt(`${decision}-${clientId}`, () =>
			createDeveloperSdk(cookies).admin.decide(clientId, decision, formText(form, 'reason')),
		);
		if (outcome.failure) {
			return outcome.failure;
		}
		return { decided: clientId };
	};
}

export const actions: Actions = {
	approve: decisionAction('approve'),
	reject: decisionAction('reject'),
	suspend: decisionAction('suspend'),
	verifyOrganization: async ({ cookies, request }) => {
		const form = await request.formData();
		const handle = formText(form, 'handle');
		const verified = formText(form, 'verified') === 'true';
		const outcome = await attempt(`verify-${handle}`, () => createDeveloperSdk(cookies).admin.setOrganizationVerified(handle, verified));
		if (outcome.failure) {
			return outcome.failure;
		}
		return { organization: handle };
	},
	rateLimit: async ({ cookies, request }) => {
		const form = await request.formData();
		const clientId = formText(form, 'clientId');
		const multiplier = multiplierOf(formText(form, 'multiplier'));
		const outcome = await attempt(`limit-${clientId}`, () => createDeveloperSdk(cookies).admin.setRateLimitMultiplier(clientId, multiplier));
		if (outcome.failure) {
			return outcome.failure;
		}
		return { limited: clientId };
	},
};

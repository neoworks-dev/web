import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createDeveloperSdk, orFail } from '$lib/server/developerSdk';

export const GET: RequestHandler = async ({ cookies, url }) => {
	const handle = url.searchParams.get('handle');
	if (handle === null || handle === '') {
		return json({ available: false, reason: 'invalid' });
	}
	const availability = await orFail(createDeveloperSdk(cookies).handles.availability(handle));
	return json(availability);
};

import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { developer } = await parent();
	if (developer === null || developer.handle === null) {
		return redirect(303, '/dashboard/developer/handle');
	}
	return redirect(303, `/dashboard/developer/${developer.handle}`);
};

import type { LayoutServerLoad } from './$types';
import { currentUser } from '$lib/server/currentUser';

export const load: LayoutServerLoad = async ({ cookies, fetch }) => ({
	user: await currentUser(cookies, fetch)
});

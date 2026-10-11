import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

const HANDLE_PAGE = '/dashboard/developer/handle';

export const load: LayoutServerLoad = async ({ parent, url }) => {
	const { developer } = await parent();
	if (developer === null) {
		return error(502, 'The developer API is not reachable');
	}
	const onHandlePage = url.pathname === HANDLE_PAGE;
	if (developer.handle === null && !onHandlePage) {
		return redirect(303, HANDLE_PAGE);
	}
	if (developer.handle !== null && onHandlePage) {
		return redirect(303, `/dashboard/developer/${developer.handle}`);
	}
	return {};
};

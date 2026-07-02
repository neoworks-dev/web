import { redirect } from '@sveltejs/kit';

// /docs has no page of its own — send visitors to the first documented product.
export const load = () => {
	redirect(307, '/docs/neoworks');
};

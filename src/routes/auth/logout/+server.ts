import { redirect } from '@sveltejs/kit';
import { CookiesTokenStorage } from '$lib/server/tokenStorage';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
    new CookiesTokenStorage(cookies).clear();

    throw redirect(303, '/');
};

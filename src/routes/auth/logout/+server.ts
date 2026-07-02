import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deleteSession } from '$lib/server/users';

export const POST: RequestHandler = async ({ cookies }) => {
    const session = cookies.get('session');
    if (session) await deleteSession(session);

    cookies.delete('session', { path: '/' });
    cookies.delete('nw_access_token', { path: '/' });

    throw redirect(303, '/');
};
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchDocs } from '$lib/server/docsSearch';

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams.get('q') ?? '';
	const results = searchDocs(query);
	return json({ results });
};

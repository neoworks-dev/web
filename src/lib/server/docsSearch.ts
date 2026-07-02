// Server-side docs search. Reads the docs .svx sources, builds a lightweight index
// once at module load, and ranks substring matches per request. Lives in $lib/server
// so it never reaches the client bundle — the browser hits /docs/search instead.

export type DocResult = {
	title: string;
	page: string;
	href: string;
	description?: string;
	isHeading: boolean;
	excerpt?: string;
};

type IndexEntry = DocResult & {
	/** Lowercased haystack used for matching only. */
	body: string;
};

const rawFiles = import.meta.glob('/src/routes/**/+page.svx', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

function routeFromFile(file: string): string {
	const path = file
		.replace('/src/routes', '')
		.replace('/+page.svx', '')
		.replace(/\/\([^)]+\)/g, ''); // strip SvelteKit route groups like (public)
	return path === '' ? '/' : path;
}

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
	const match = raw.match(/^---\n([\s\S]*?)\n---/);
	if (!match) return { meta: {}, body: raw };

	const meta: Record<string, string> = {};
	for (const line of match[1].split('\n')) {
		const field = line.match(/^(\w+):\s*(.*)$/);
		if (field) meta[field[1]] = field[2].trim();
	}
	return { meta, body: raw.slice(match[0].length) };
}

// Mirrors github-slugger (used by rehype-slug) closely enough for heading anchors.
function slugify(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/\s+/g, '-');
}

function stripMarkdown(body: string): string {
	return body
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/`[^`]*`/g, ' ')
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/[#>*_|-]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function buildIndex(): IndexEntry[] {
	const entries: IndexEntry[] = [];

	for (const [file, raw] of Object.entries(rawFiles)) {
		const href = routeFromFile(file);
		if (!href.startsWith('/docs')) continue;

		const { meta, body } = parseFrontmatter(raw);
		const pageTitle = meta.title ?? href;
		const text = stripMarkdown(body);

		entries.push({
			title: pageTitle,
			page: pageTitle,
			href,
			description: meta.description,
			isHeading: false,
			excerpt: meta.description,
			body: `${pageTitle} ${meta.description ?? ''} ${text}`.toLowerCase()
		});

		const headingRe = /^(#{2,3})\s+(.+)$/gm;
		let heading: RegExpExecArray | null;
		while ((heading = headingRe.exec(body)) !== null) {
			const headingText = heading[2].trim().replace(/[*_`]/g, '');
			entries.push({
				title: headingText,
				page: pageTitle,
				href: `${href}#${slugify(headingText)}`,
				isHeading: true,
				body: headingText.toLowerCase()
			});
		}
	}

	return entries;
}

const index = buildIndex();

export function searchDocs(query: string, limit = 8): DocResult[] {
	const normalized = query.trim().toLowerCase();
	if (!normalized) return [];

	const terms = normalized.split(/\s+/);
	const scored: Array<{ entry: IndexEntry; score: number }> = [];

	for (const entry of index) {
		const titleText = entry.title.toLowerCase();
		let score = 0;
		let matchesAll = true;

		for (const term of terms) {
			const inTitle = titleText.includes(term);
			const inBody = entry.body.includes(term);
			if (!inTitle && !inBody) {
				matchesAll = false;
				break;
			}
			if (inTitle) score += entry.isHeading ? 6 : 10;
			else score += 1;
		}

		if (matchesAll) scored.push({ entry, score });
	}

	scored.sort((a, b) => b.score - a.score);
	return scored.slice(0, limit).map(({ entry }) => {
		// Drop the matching-only `body` from the response.
		const { body, ...result } = entry;
		return result;
	});
}

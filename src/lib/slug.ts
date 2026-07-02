/**
 * Derives an organization slug from a display name: lowercased, non-alphanumeric
 * runs collapsed to single hyphens, trimmed. Used as the org token in scopes.
 */
export function slugify(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/**
 * The current dashboard "view scope": whether the signed-in user is looking at
 * their personal space or acting within one of their organizations. The account
 * is always the same user — only the scope changes.
 *
 * The scope is derived from the current route (an org route → that org,
 * otherwise personal), so it persists across the session via the URL. The
 * Sidebar keeps this store in sync so any component can read the active scope.
 */

export type ViewScope =
	| { type: 'personal' }
	| { type: 'org'; id: string; name: string; role?: string };

export const viewScope = $state<{ current: ViewScope }>({ current: { type: 'personal' } });

export function setViewScope(next: ViewScope) {
	viewScope.current = next;
}

/** Default landing route for a scope — where selecting it navigates to. */
export function scopeHome(scope: ViewScope): string {
	if (scope.type === 'org') return `/dashboard/organizations/${scope.id}/clients`;
	return '/dashboard';
}

/**
 * Cross-page state for the multi-step client-creation wizard. The client is
 * created by a single mutation on the final step, so the details and selected
 * scopes must survive navigation between wizard pages — this reactive module
 * holds that draft.
 */

export interface ClientDraft {
	organizationId: string;
	id: string;
	name: string;
	isPublic: boolean;
	redirectUris: string;
	/** Selected scope strings, from catalog checkboxes and custom entries. */
	scopes: string[];
}

function empty(organizationId: string): ClientDraft {
	return {
		organizationId,
		id: '',
		name: '',
		isPublic: false,
		redirectUris: '',
		scopes: [],
	};
}

export const clientDraft = $state<ClientDraft>(empty(''));

/** Resets the draft for a fresh run under the given organization. */
export function resetClientDraft(organizationId: string) {
	Object.assign(clientDraft, empty(organizationId));
}

/** Ensures the draft belongs to this org; resets it if the user arrived fresh
 *  (e.g. reloaded the details step or switched orgs). */
export function ensureDraftForOrg(organizationId: string) {
	if (clientDraft.organizationId !== organizationId) {
		resetClientDraft(organizationId);
	}
}

export function toggleScope(scope: string) {
	const index = clientDraft.scopes.indexOf(scope);
	if (index === -1) {
		clientDraft.scopes = [...clientDraft.scopes, scope];
	} else {
		clientDraft.scopes = clientDraft.scopes.filter((s) => s !== scope);
	}
}

export function hasScope(scope: string): boolean {
	return clientDraft.scopes.includes(scope);
}

/** Adds one or more whitespace/comma-separated scopes, ignoring duplicates. */
export function addCustomScopes(raw: string) {
	const additions = raw
		.split(/[\s,]+/)
		.map((s) => s.trim())
		.filter(Boolean);
	const next = new Set(clientDraft.scopes);
	for (const scope of additions) next.add(scope);
	clientDraft.scopes = [...next];
}

/**
 * Scope catalog for the client-creation scope picker.
 *
 * Scopes follow `[organization:]entity:action`. The picker offers three sources,
 * all grouped by their top-level object (the entity):
 *  - Account: the standard OIDC scopes (openid/profile/email/offline).
 *  - First-party: curated Neoworks data objects with read/write actions.
 *  - Org data: entities discovered from the organization's own client databases
 *    (see {@link entityGroupsFromScopeEntities}).
 * Anything outside the catalog — including third-party `org:entity:action`
 * references — can still be added via the picker's custom-scope input.
 */
import type { ScopeEntity } from '@neoworks-dev/sdk';

export interface ScopeOption {
	/** Full scope string, e.g. "contacts:read" or "openid". */
	scope: string;
	/** Short action label, e.g. "Read". */
	action: string;
	description: string;
}

export interface ScopeGroup {
	/** Top-level object key, e.g. "contacts". */
	key: string;
	label: string;
	description: string;
	options: ScopeOption[];
}

/** Standard OIDC scopes — identity, not entity:action data access. */
export const accountGroup: ScopeGroup = {
	key: 'account',
	label: 'Account',
	description: 'Identity and sign-in.',
	options: [
		{ scope: 'openid', action: 'Identity', description: 'Verify who the user is' },
		{ scope: 'profile', action: 'Profile', description: 'Name, username, and avatar' },
		{ scope: 'email', action: 'Email', description: 'The user’s email address' },
		{ scope: 'offline', action: 'Offline', description: 'Stay signed in while the app is closed' },
	],
};

/** Read/write pair for a first-party data object. */
function readWrite(key: string, noun: string): ScopeOption[] {
	return [
		{ scope: `${key}:read`, action: 'Read', description: `View ${noun}` },
		{ scope: `${key}:write`, action: 'Write', description: `Create and edit ${noun}` },
	];
}

/** Curated first-party Neoworks data objects. */
export const firstPartyGroups: ScopeGroup[] = [
	{ key: 'contacts', label: 'Contacts', description: 'People and their details.', options: readWrite('contacts', 'names, emails and phone numbers') },
	{ key: 'events', label: 'Calendar', description: 'Events and availability.', options: readWrite('events', 'calendar events') },
	{ key: 'tasks', label: 'Tasks', description: 'To-dos and their status.', options: readWrite('tasks', 'tasks') },
	{ key: 'photos', label: 'Photos', description: 'The encrypted photo library.', options: readWrite('photos', 'photos') },
	{ key: 'storage', label: 'Files', description: 'Stored objects and files.', options: readWrite('storage', 'files') },
	{ key: 'email', label: 'Mail', description: 'Mailbox messages.', options: readWrite('email', 'mailbox messages') },
	{ key: 'memories', label: 'Memories', description: 'Saved memories and notes.', options: readWrite('memories', 'memories') },
	{ key: 'notifications', label: 'Notifications', description: 'Delivered notifications.', options: readWrite('notifications', 'notifications') },
	{
		key: 'tokens',
		label: 'Tokens',
		description: 'OAuth refresh tokens.',
		options: [{ scope: 'tokens:read', action: 'Read', description: 'List active tokens' }],
	},
];

/** Only these table kinds are meaningful scope targets; relation/helper tables
 *  are internal plumbing. */
const SCOPABLE_KINDS = new Set(['data', 'org']);

/**
 * Turns the organization's own database entities into scope groups (one per
 * entity, each offering read/write). Entities are deduplicated by name.
 */
export function entityGroupsFromScopeEntities(entities: ScopeEntity[]): ScopeGroup[] {
	const byEntity = new Map<string, ScopeEntity>();
	for (const entity of entities) {
		if (!SCOPABLE_KINDS.has(entity.kind)) continue;
		if (!byEntity.has(entity.entity)) byEntity.set(entity.entity, entity);
	}

	const groups: ScopeGroup[] = [];
	for (const [name, entity] of byEntity) {
		groups.push({
			key: name,
			label: name,
			description: `From the “${entity.database}” database.`,
			options: readWrite(name, `“${name}” records`),
		});
	}
	return groups;
}

/** All scope strings a set of groups can offer — used to tell whether a
 *  selected scope came from the catalog or was entered as a custom scope. */
export function catalogScopeSet(groups: ScopeGroup[]): Set<string> {
	const scopes = new Set<string>();
	for (const group of groups) {
		for (const option of group.options) scopes.add(option.scope);
	}
	return scopes;
}

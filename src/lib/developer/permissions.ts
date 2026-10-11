import type { Grant, Permission } from '@neoworks-dev/platform'

export const ORGANIZATION_WIDE_PERMISSIONS: Permission[] = [
	'organization.manage',
	'members.manage',
	'domains.manage',
	'apps.create',
	'schemas.publish',
	'audit.view',
]

export const PER_APP_PERMISSIONS: Permission[] = ['apps.edit', 'apps.secrets', 'apps.delete', 'apps.review', 'usage.view']

export const ALL_PERMISSIONS: Permission[] = [...ORGANIZATION_WIDE_PERMISSIONS, ...PER_APP_PERMISSIONS]

export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
	'organization.manage': 'Edit the profile and archive the organization',
	'members.manage': 'Invite and remove members, change their permissions',
	'domains.manage': 'Add and verify domains',
	'apps.create': 'Register new apps',
	'schemas.publish': 'Publish schema versions into the organization scope',
	'audit.view': 'Read the audit log',
	'apps.edit': 'Edit name, description, redirect URIs, scopes and logo',
	'apps.secrets': 'Rotate a confidential app secret',
	'apps.delete': 'Delete an app and revoke its tokens',
	'apps.review': 'Submit an app for review',
	'usage.view': 'See aggregate usage',
	'platform.admin': 'Review apps and verify organizations for the whole platform',
}

export type GrantPresetKey = 'owner' | 'maintainer' | 'viewer'

export interface GrantPreset {
	key: GrantPresetKey
	label: string
	description: string
	permissions: Permission[]
}

export const GRANT_PRESETS: GrantPreset[] = [
	{ key: 'owner', label: 'Owner', description: 'Every permission', permissions: ALL_PERMISSIONS },
	{
		key: 'maintainer',
		label: 'Maintainer',
		description: 'Create, edit, review and publish; no member or domain management',
		permissions: ['apps.create', 'schemas.publish', 'apps.edit', 'apps.secrets', 'apps.review', 'usage.view'],
	},
	{ key: 'viewer', label: 'Viewer', description: 'Aggregate usage only', permissions: ['usage.view'] },
]

export function isOrganizationWideOnly(permission: Permission): boolean {
	return ORGANIZATION_WIDE_PERMISSIONS.includes(permission)
}

export function presetGrants(key: GrantPresetKey): Grant[] {
	const preset = GRANT_PRESETS.find((candidate) => candidate.key === key)
	if (preset === undefined) {
		return []
	}
	return preset.permissions.map((permission) => ({ permission, appId: null }))
}

/** Whether the grants allow the permission, for the whole organization or for this app. */
export function holdsPermission(grants: Grant[], permission: Permission, appId: string | null = null): boolean {
	return grants.some((grant) => {
		if (grant.permission !== permission) {
			return false
		}
		return grant.appId === null || grant.appId === appId
	})
}

export function hasGrant(grants: Grant[], permission: Permission, appId: string | null): boolean {
	return grants.some((grant) => grant.permission === permission && grant.appId === appId)
}

/** Adds or removes exactly one grant, leaving the others untouched. */
export function withGrant(grants: Grant[], grant: Grant, enabled: boolean): Grant[] {
	const others = grants.filter((existing) => !(existing.permission === grant.permission && existing.appId === grant.appId))
	if (!enabled) {
		return others
	}
	return [...others, grant]
}

function coversGrant(callerGrants: Grant[], requested: Grant): boolean {
	if (requested.appId === null) {
		return hasGrant(callerGrants, requested.permission, null)
	}
	return holdsPermission(callerGrants, requested.permission, requested.appId)
}

/** Grants a caller may not hand out: broader than the reach at which they hold the permission. */
export function escalatingGrants(callerGrants: Grant[], requested: Grant[]): Grant[] {
	return requested.filter((grant) => !coversGrant(callerGrants, grant))
}

export function missingPermissionText(permission: Permission): string {
	return `Requires the ${permission} permission`
}

export function describeGrant(grant: Grant, appNames: Record<string, string>): string {
	if (grant.appId === null) {
		return `${grant.permission} (organization-wide)`
	}
	const appName = appNames[grant.appId]
	if (appName === undefined) {
		return `${grant.permission} (${grant.appId})`
	}
	return `${grant.permission} (${appName})`
}

/** Which preset the grants equal exactly, if any. */
export function matchingPreset(grants: Grant[]): GrantPresetKey | null {
	for (const preset of GRANT_PRESETS) {
		const expected = presetGrants(preset.key)
		const sameSize = expected.length === grants.length
		if (sameSize && expected.every((grant) => hasGrant(grants, grant.permission, null))) {
			return preset.key
		}
	}
	return null
}

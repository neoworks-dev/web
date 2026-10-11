import type { OwnerWithGrants, Platform } from '@neoworks-dev/platform'

export interface DeveloperContext {
	/** The signed-in user's handle; null until they pick one. */
	handle: string | null
	/** Personal owner first, then every organization the user belongs to. */
	owners: OwnerWithGrants[]
	/** Whether the user administers the platform: reviews apps, verifies organizations. */
	admin: boolean
}

/** The owners the sidebar switcher offers; null when the developer API cannot be reached. */
export async function loadDeveloperContext(sdk: Platform): Promise<DeveloperContext | null> {
	try {
		const [handle, owners, admin] = await Promise.all([sdk.handles.mine(), sdk.handles.owners(), isAdministrator(sdk)])
		return { handle, owners, admin }
	} catch {
		return null
	}
}

/** The admin check never fails the page: anyone it cannot confirm is not an administrator. */
async function isAdministrator(sdk: Platform): Promise<boolean> {
	try {
		return await sdk.admin.isAdmin()
	} catch {
		return false
	}
}

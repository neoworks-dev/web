import type { OwnerWithGrants, Sdk } from '@neoworks-dev/sdk'

export interface DeveloperContext {
	/** The signed-in user's handle; null until they pick one. */
	handle: string | null
	/** Personal owner first, then every organization the user belongs to. */
	owners: OwnerWithGrants[]
}

/** The owners the sidebar switcher offers; null when the developer API cannot be reached. */
export async function loadDeveloperContext(sdk: Sdk): Promise<DeveloperContext | null> {
	try {
		const [handle, owners] = await Promise.all([sdk.handles.mine(), sdk.handles.owners()])
		return { handle, owners }
	} catch {
		return null
	}
}

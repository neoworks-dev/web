import { NeoworksApiError, type DeveloperApp, type Grant, type OwnerDomain, type RegistrySchema, type Sdk } from '@neoworks-dev/sdk'
import { holdsPermission } from '$lib/developer/permissions'
import type { RejectedPublish } from '$lib/developer/todos'

export async function loadRejectedPublishes(sdk: Sdk, schemas: RegistrySchema[]): Promise<RejectedPublish[]> {
	const histories = await Promise.all(
		schemas.map(async (schema) => ({ schema, publishes: await sdk.schemas.publishes(schema.scope, schema.name) })),
	)
	const rejected: RejectedPublish[] = []
	for (const { schema, publishes } of histories) {
		for (const publish of publishes.filter((attempt) => !attempt.accepted)) {
			rejected.push({ scope: schema.scope, name: schema.name, version: publish.version })
		}
	}
	return rejected
}

export async function countSentInvitations(sdk: Sdk, ownerHandle: string, isOrganization: boolean, grants: Grant[]): Promise<number> {
	if (!isOrganization || !holdsPermission(grants, 'members.manage')) {
		return 0
	}
	return (await sdk.organizations.invitations(ownerHandle)).length
}

export async function countMembers(sdk: Sdk, ownerHandle: string, isOrganization: boolean): Promise<number> {
	if (!isOrganization) {
		return 1
	}
	return (await sdk.organizations.members(ownerHandle)).length
}

export interface OwnerOverview {
	apps: DeveloperApp[]
	schemas: RegistrySchema[]
	domains: OwnerDomain[]
}

export async function loadOwnerOverview(sdk: Sdk, ownerHandle: string): Promise<OwnerOverview> {
	const [summaries, schemas, domains] = await Promise.all([
		sdk.apps.listForOwner(ownerHandle),
		sdk.schemas.list({ scope: ownerHandle }),
		listDomainsIfServed(sdk, ownerHandle),
	])
	const apps = await Promise.all(summaries.map((summary) => sdk.apps.get(summary.id)))
	return { apps, schemas, domains }
}

/** The owner's domains; none while the API does not serve the domain routes yet. */
async function listDomainsIfServed(sdk: Sdk, ownerHandle: string): Promise<OwnerDomain[]> {
	try {
		return await sdk.domains.list(ownerHandle)
	} catch (caught) {
		if (caught instanceof NeoworksApiError && caught.status === 404) {
			return []
		}
		throw caught
	}
}

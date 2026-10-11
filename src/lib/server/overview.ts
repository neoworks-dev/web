import { NeoworksApiError, type DeveloperApp, type Grant, type OwnerDomain, type PublishAttempt, type RegistrySchema, type Sdk } from '@neoworks-dev/sdk'
import { holdsPermission } from '$lib/developer/permissions'
import type { RejectedPublish } from '$lib/developer/todos'

export interface SchemaHistory {
	schema: RegistrySchema
	publishes: PublishAttempt[]
}

/** A schema's publish attempts; empty for members without schemas.publish, who may not read them. */
async function loadPublishes(sdk: Sdk, schema: RegistrySchema): Promise<PublishAttempt[]> {
	try {
		return await sdk.schemas.publishes(schema.scope, schema.name)
	} catch (caught) {
		if (caught instanceof NeoworksApiError && caught.code === 'missing_permission') {
			return []
		}
		throw caught
	}
}

export function loadSchemaHistories(sdk: Sdk, schemas: RegistrySchema[]): Promise<SchemaHistory[]> {
	return Promise.all(schemas.map(async (schema) => ({ schema, publishes: await loadPublishes(sdk, schema) })))
}

export async function loadRejectedPublishes(sdk: Sdk, schemas: RegistrySchema[]): Promise<RejectedPublish[]> {
	const histories = await loadSchemaHistories(sdk, schemas)
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

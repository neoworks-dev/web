import type { Owner, Permission, ReviewDecision, ReviewStatus } from '@neoworks-dev/sdk'
import type { Handler, Reply, RequestContext, Route } from './developerApiStub.ts'
import { daysFromNow, type StubApp, type StubConnection, type World } from './developerApiStubWorld.ts'
import { fail, invalid, isRecord } from './developerApiStubRules.ts'

// The routes that sit beside the developer contract of #39: the connected-apps
// page (#36, #37, #35), the account's storage (#33) and the Neoworks admin view
// (#35, #36, #34). Same rules as the Go api: only administrators use `/admin`,
// a reject or suspend needs a reason, and the account sets the caps on its apps.

type RouteFactory = (method: string, path: string, handler: Handler, isPublic?: boolean) => Route

const PLATFORM_ADMIN: Permission = 'platform.admin'

function ok(body: unknown): Reply {
  return { status: 200, body }
}

function jsonBody(context: RequestContext): Record<string, unknown> {
  let parsed: unknown = null
  try {
    parsed = JSON.parse(context.rawBody.toString('utf8'))
  } catch {
    return invalid('body', 'the request body must be JSON')
  }
  if (!isRecord(parsed)) {
    return invalid('body', 'the request body must be a JSON object')
  }
  return parsed
}

function ownerOf(world: World, handle: string | null): Owner | null {
  if (handle === null) {
    return null
  }
  const organization = world.organizations.find((candidate) => candidate.handle === handle)
  if (organization !== undefined) {
    return { handle, kind: 'organization', displayName: organization.displayName, verified: organization.neoworksVerified }
  }
  if (handle === 'neoworks') {
    return { handle, kind: 'organization', displayName: 'Neoworks', verified: true }
  }
  const user = world.users.find((candidate) => candidate.handle === handle)
  if (user === undefined) {
    return null
  }
  return { handle, kind: 'user', displayName: user.displayName, verified: false }
}

// ---------------------------------------------------------------- connected apps

function connectedAppView(world: World, connection: StubConnection) {
  return {
    clientId: connection.clientId,
    name: connection.name,
    description: connection.description,
    owner: ownerOf(world, connection.ownerHandle),
    verified: connection.verified,
    firstParty: connection.firstParty,
    reviewStatus: connection.reviewStatus,
    reviewReason: connection.reviewReason,
    logoUrl: connection.logoUrl,
    scopes: connection.scopes,
    authorizedAt: connection.authorizedAt,
    lastAuthorizedAt: connection.authorizedAt,
    installs: connection.installs.map((install) => ({
      id: install.id,
      userId: 'user-moritz',
      clientId: connection.clientId,
      encPub: '',
      signPub: '',
      name: install.name,
      createdAt: install.createdAt,
      revokedAt: install.revokedAt,
    })),
    storage: { usedBytes: connection.usedBytes, capBytes: connection.capBytes },
  }
}

function listConnectedApps(context: RequestContext): Reply {
  return ok({ apps: context.world.connections.map((connection) => connectedAppView(context.world, connection)) })
}

function revokeInstall(context: RequestContext): Reply {
  for (const connection of context.world.connections) {
    const install = connection.installs.find((candidate) => candidate.id === context.params.id)
    if (install !== undefined) {
      install.revokedAt = daysFromNow(0)
      return { status: 204 }
    }
  }
  return fail(404, 'not_found', 'not found')
}

// ---------------------------------------------------------------- storage

function storageView(world: World) {
  return {
    quotaBytes: world.storageQuotaBytes,
    usedBytes: world.connections.reduce((sum, connection) => sum + connection.usedBytes, 0),
    apps: world.connections.map((connection) => ({
      clientId: connection.clientId,
      usedBytes: connection.usedBytes,
      capBytes: connection.capBytes,
    })),
  }
}

function getStorage(context: RequestContext): Reply {
  return ok(storageView(context.world))
}

function setAppCap(context: RequestContext): Reply {
  const connection = context.world.connections.find((candidate) => candidate.clientId === context.params.clientId)
  if (connection === undefined) {
    return fail(404, 'not_found', 'you have not authorized this app')
  }
  const { capBytes } = jsonBody(context)
  if (capBytes === null) {
    connection.capBytes = null
    return ok(storageView(context.world))
  }
  if (typeof capBytes !== 'number' || !Number.isInteger(capBytes) || capBytes < 0) {
    return invalid('capBytes', 'capBytes must be 0 or more, or null to remove the cap')
  }
  connection.capBytes = capBytes
  return ok(storageView(context.world))
}

// ---------------------------------------------------------------- admin

function requireAdministrator(context: RequestContext): void {
  if (!context.world.administratorIds.includes(context.user.id)) {
    fail(403, 'missing_permission', `this needs the ${PLATFORM_ADMIN} permission`, undefined, PLATFORM_ADMIN)
  }
}

function adminSession(context: RequestContext): Reply {
  return ok({ admin: context.world.administratorIds.includes(context.user.id) })
}

function reviewedAppView(world: World, app: StubApp) {
  return {
    id: app.id,
    name: app.name,
    type: app.type,
    reviewStatus: app.review.status,
    verified: false,
    createdAt: app.createdAt,
    owner: ownerOf(world, app.ownerHandle),
    description: app.description,
    homepage: app.homepage,
    redirectUris: app.redirectUris,
    scopes: app.scopes,
    logoHeld: app.logoHeld,
    review: app.review,
    updatedAt: app.updatedAt,
  }
}

function adminReviews(context: RequestContext): Reply {
  requireAdministrator(context)
  const status = context.query.get('status') || 'pending'
  const apps = context.world.apps.filter((app) => app.review.status === status)
  const items = apps.map((app) => ({
    app: reviewedAppView(context.world, app),
    logoUrl: null,
    privacyPolicyUrl: app.privacyPolicyUrl,
    supportContact: app.supportContact,
    scopes: app.scopes,
  }))
  return ok({ items })
}

const DECISION_OUTCOMES: Record<ReviewDecision, { status: ReviewStatus; from: ReviewStatus[]; needsReason: boolean }> = {
  approve: { status: 'approved', from: ['pending', 'suspended'], needsReason: false },
  reject: { status: 'rejected', from: ['pending'], needsReason: true },
  suspend: { status: 'suspended', from: ['none', 'pending', 'approved', 'rejected'], needsReason: true },
}

function parseDecision(value: unknown): ReviewDecision {
  if (value === 'approve' || value === 'reject' || value === 'suspend') {
    return value
  }
  return invalid('decision', 'decision must be approve, reject or suspend')
}

function reasonOf(value: unknown): string {
  if (typeof value !== 'string') {
    return ''
  }
  return value.trim()
}

function reasonOrNull(reason: string): string | null {
  if (reason === '') {
    return null
  }
  return reason
}

function adminDecide(context: RequestContext): Reply {
  requireAdministrator(context)
  const app = context.world.apps.find((candidate) => candidate.id === context.params.clientId)
  if (app === undefined) {
    return fail(404, 'not_found', 'no such app')
  }
  const body = jsonBody(context)
  const decision = parseDecision(body.decision)
  const outcome = DECISION_OUTCOMES[decision]
  const reason = reasonOf(body.reason)
  if (outcome.needsReason && reason === '') {
    return invalid('reason', 'tell the developer why')
  }
  if (!outcome.from.includes(app.review.status)) {
    return fail(409, 'review_state', 'the app is not in a status this decision can be made from')
  }
  app.review = { status: outcome.status, reason: reasonOrNull(reason), updatedAt: daysFromNow(0) }
  return ok({ app: reviewedAppView(context.world, app) })
}

function adminVerifyOrganization(context: RequestContext): Reply {
  requireAdministrator(context)
  const organization = context.world.organizations.find((candidate) => candidate.handle === context.params.handle)
  if (organization === undefined) {
    return fail(404, 'not_found', 'no such organization')
  }
  const { verified } = jsonBody(context)
  organization.neoworksVerified = verified === true
  return ok(ownerOf(context.world, organization.handle))
}

function adminRateLimit(context: RequestContext): Reply {
  requireAdministrator(context)
  const app = context.world.apps.find((candidate) => candidate.id === context.params.clientId)
  if (app === undefined) {
    return fail(404, 'not_found', 'no such app')
  }
  const { multiplier } = jsonBody(context)
  if (multiplier === null) {
    app.rateLimitMultiplier = null
    return ok({ multiplier: null })
  }
  if (typeof multiplier !== 'number' || multiplier <= 0 || multiplier > 100) {
    return invalid('multiplier', 'multiplier must be above 0 and at most 100, or null')
  }
  app.rateLimitMultiplier = multiplier
  return ok({ multiplier })
}

export function platformRoutes(route: RouteFactory): Route[] {
  return [
    route('GET', '/api/v1/connected-apps', listConnectedApps),
    route('DELETE', '/api/v1/installs/:id', revokeInstall),
    route('GET', '/api/v1/storage', getStorage),
    route('PUT', '/api/v1/storage/apps/:clientId/cap', setAppCap),
    route('GET', '/api/v1/admin/session', adminSession),
    route('GET', '/api/v1/admin/reviews', adminReviews),
    route('POST', '/api/v1/admin/apps/:clientId/review', adminDecide),
    route('PUT', '/api/v1/admin/apps/:clientId/rate-limit', adminRateLimit),
    route('PUT', '/api/v1/admin/organizations/:handle/verified', adminVerifyOrganization),
  ]
}

import { createServer } from 'node:http'
import { randomBytes } from 'node:crypto'
import type { AuditEntry, Grant, Owner, OwnerDomain, Permission, UsagePoint } from '@neoworks-dev/sdk'
import {
  APP_PERMISSIONS,
  ALL_PERMISSIONS,
  daysFromNow,
  organizationWide,
  seedWorld,
  type StubApp,
  type StubInvitation,
  type StubOrganization,
  type StubUser,
  type World,
} from './developerApiStubWorld.ts'
import { platformRoutes } from './developerApiStubPlatform.ts'
import {
  StubError,
  appPermissionsFor,
  domainProofPasses,
  fail,
  findApp,
  findOrganization,
  grantsFor,
  handleProblem,
  holds,
  invalid,
  isHttpsUrl,
  isRecord,
  parseAppFields,
  parseDomain,
  parseGrants,
  parseHandle,
  parseDisplayName,
  requireKnownApps,
  parseText,
  parseVerificationMethod,
  requireActiveOrganization,
  requireMembersManagerRemains,
  requireNoEscalation,
  requireOrganizationMember,
  requirePermission,
  requireVisibleApp,
  requireVisibleOwner,
} from './developerApiStubRules.ts'

// Stand-in for the developer REST contract of issue #39 (handles, organizations,
// apps, schemas, domains) with seeded data, so the dashboard can be built and
// tested before the Go backend exists. It enforces the contract's permission
// and validation rules and answers with `{ error, message, field? }`.
//
// Sign in with the bearer token `stub-token-moritz` (has a handle, owns the
// `acme` organization, partial rights in `globex`) or `stub-token-newcomer`
// (no handle yet). POST /__reset restores the seeded data.

let world: World = seedWorld()

export interface RequestContext {
  world: World
  user: StubUser
  params: Record<string, string>
  query: URLSearchParams
  rawBody: Buffer
  contentType: string
  origin: string
}

export interface Reply {
  status: number
  body?: unknown
  binary?: { bytes: Buffer; contentType: string }
}

export type Handler = (context: RequestContext) => Reply

export interface Route {
  method: string
  pattern: RegExp
  parameterNames: string[]
  isPublic: boolean
  handler: Handler
}

function ok(body: unknown): Reply {
  return { status: 200, body }
}

function created(body: unknown): Reply {
  return { status: 201, body }
}

function noContent(): Reply {
  return { status: 204 }
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

function newId(prefix: string): string {
  const id = `${prefix}_${world.nextId}_${randomBytes(3).toString('hex')}`
  world.nextId += 1
  return id
}

// ---------------------------------------------------------------- views

function ownerDomains(handle: string): OwnerDomain[] {
  const domains = world.domains.get(handle)
  if (domains === undefined) {
    return []
  }
  return domains
}

/** Organizations are verified when a Neoworks administrator reviewed them; people never are. */
function ownerView(handle: string): Owner {
  const organization = world.organizations.find((candidate) => candidate.handle === handle)
  if (organization !== undefined) {
    return { handle, kind: 'organization', displayName: organization.displayName, verified: organization.neoworksVerified }
  }
  const user = world.users.find((candidate) => candidate.handle === handle)
  if (user === undefined) {
    return fail(404, 'not_found', `no owner named ${handle}`)
  }
  return { handle, kind: 'user', displayName: user.displayName, verified: false }
}

function userAsOwner(user: StubUser): Owner {
  if (user.handle === null) {
    return { handle: '', kind: 'user', displayName: user.displayName, verified: false }
  }
  return ownerView(user.handle)
}

function organizationView(organization: StubOrganization, myGrants: Grant[]) {
  return {
    ...ownerView(organization.handle),
    createdAt: organization.createdAt,
    archivedAt: organization.archivedAt,
    myGrants,
  }
}

function hostIsOnVerifiedDomain(host: string, domains: OwnerDomain[]): boolean {
  return domains.some((entry) => entry.verified && (host === entry.domain || host.endsWith(`.${entry.domain}`)))
}

function appIsVerified(app: StubApp): boolean {
  const domains = ownerDomains(app.ownerHandle)
  const secureUris = app.redirectUris.filter((uri) => uri.startsWith('https://'))
  if (secureUris.length === 0) {
    return false
  }
  const urls = [...secureUris]
  if (app.homepage.startsWith('https://')) {
    urls.push(app.homepage)
  }
  return urls.every((url) => hostIsOnVerifiedDomain(new URL(url).hostname, domains))
}

function appSummaryView(app: StubApp) {
  return {
    id: app.id,
    name: app.name,
    type: app.type,
    reviewStatus: app.review.status,
    verified: appIsVerified(app),
    createdAt: app.createdAt,
  }
}

function appView(app: StubApp, grants: Grant[], origin: string) {
  let logoUrl: string | null = null
  if (app.logo !== null) {
    logoUrl = `${origin}/logos/${app.id}?v=${Date.parse(app.updatedAt)}`
  }
  return {
    ...appSummaryView(app),
    owner: ownerView(app.ownerHandle),
    description: app.description,
    homepage: app.homepage,
    redirectUris: app.redirectUris,
    scopes: app.scopes,
    logoUrl,
    logoHeld: app.logoHeld,
    review: app.review,
    updatedAt: app.updatedAt,
    myPermissions: appPermissionsFor(grants, app.id),
  }
}

function memberView(organization: StubOrganization, userId: string) {
  const member = organization.members.find((candidate) => candidate.userId === userId)
  const user = world.users.find((candidate) => candidate.id === userId)
  if (member === undefined || user === undefined) {
    return fail(404, 'not_found', 'no such member')
  }
  return {
    userId,
    handle: user.handle,
    displayName: user.displayName,
    email: user.email,
    joinedAt: member.joinedAt,
    grants: member.grants,
  }
}

function invitationView(invitation: StubInvitation) {
  const inviter = world.users.find((candidate) => candidate.id === invitation.invitedByUserId)
  if (inviter === undefined) {
    return fail(404, 'not_found', 'inviter is gone')
  }
  return {
    id: invitation.id,
    email: invitation.email,
    contactCode: invitation.contactCode,
    grants: invitation.grants,
    invitedBy: userAsOwner(inviter),
    createdAt: invitation.createdAt,
    expiresAt: invitation.expiresAt,
  }
}

let lastAuditMilliseconds = 0

/** Audit entries are paged by timestamp, so each one gets a distinct millisecond. */
function nextAuditTimestamp(): string {
  lastAuditMilliseconds = Math.max(Date.now(), lastAuditMilliseconds + 1)
  return new Date(lastAuditMilliseconds).toISOString()
}

function recordAudit(
  context: RequestContext,
  organizationHandle: string,
  action: string,
  target: { kind: string; id: string; label: string },
  details: Record<string, unknown> = {},
): void {
  const organization = world.organizations.find((candidate) => candidate.handle === organizationHandle)
  if (organization === undefined) {
    return
  }
  const entry: AuditEntry = {
    id: String(world.nextId),
    at: nextAuditTimestamp(),
    actor: userAsOwner(context.user),
    action,
    target,
    details,
  }
  world.nextId += 1
  organization.audit.unshift(entry)
}

// ---------------------------------------------------------------- handles

function getMyHandle(context: RequestContext): Reply {
  return ok({ handle: context.user.handle })
}

function putMyHandle(context: RequestContext): Reply {
  const handle = parseHandle(context.world, jsonBody(context).handle)
  if (context.user.handle !== null) {
    return fail(409, 'handle_already_set', 'your handle is already set and never changes')
  }
  context.user.handle = handle
  return ok({ handle })
}

function handleAvailability(context: RequestContext): Reply {
  const problem = handleProblem(context.world, context.params.handle)
  if (problem === null) {
    return ok({ available: true })
  }
  return ok({ available: false, reason: problem })
}

function myOwners(context: RequestContext): Reply {
  const { user } = context
  if (user.handle === null) {
    return ok({ owners: [] })
  }
  const owners = [{ owner: ownerView(user.handle), grants: organizationWide(ALL_PERMISSIONS) }]
  for (const organization of world.organizations.filter((candidate) => candidate.archivedAt === null)) {
    const grants = grantsFor(world, user, organization.handle)
    if (grants !== null) {
      owners.push({ owner: ownerView(organization.handle), grants })
    }
  }
  return ok({ owners })
}

// ---------------------------------------------------------------- organizations

function createOrganization(context: RequestContext): Reply {
  const { user } = context
  const body = jsonBody(context)
  const handle = parseHandle(world, body.handle, false)
  const displayName = parseDisplayName(body.displayName)
  if (user.handle === null) {
    return fail(409, 'handle_required', 'pick your handle first')
  }
  parseHandle(world, handle)
  const now = new Date().toISOString()
  const organization: StubOrganization = {
    handle,
    displayName,
    createdAt: now,
    archivedAt: null,
    neoworksVerified: false,
    members: [{ userId: user.id, joinedAt: now, grants: organizationWide(ALL_PERMISSIONS) }],
    invitations: [],
    audit: [],
  }
  world.organizations.push(organization)
  recordAudit(context, handle, 'organization.created', { kind: 'organization', id: handle, label: displayName })
  return created(organizationView(organization, organizationWide(ALL_PERMISSIONS)))
}

function getOrganization(context: RequestContext): Reply {
  const organization = requireOrganizationMember(world, context.user, context.params.handle)
  const grants = requireVisibleOwner(world, context.user, organization.handle)
  return ok(organizationView(organization, grants))
}

/** The organization plus the caller's grants, after checking they hold `permission` and the organization is not archived. */
function writableOrganization(context: RequestContext, permission: Permission): { organization: StubOrganization; grants: Grant[] } {
  const organization = requireOrganizationMember(world, context.user, context.params.handle)
  const grants = requireVisibleOwner(world, context.user, organization.handle)
  requirePermission(grants, permission)
  requireActiveOrganization(organization)
  return { organization, grants }
}

function patchOrganization(context: RequestContext): Reply {
  const { organization, grants } = writableOrganization(context, 'organization.manage')
  organization.displayName = parseDisplayName(jsonBody(context).displayName)
  recordAudit(context, organization.handle, 'organization.renamed', {
    kind: 'organization',
    id: organization.handle,
    label: organization.displayName,
  })
  return ok(organizationView(organization, grants))
}

function archiveOrganization(context: RequestContext): Reply {
  const { organization, grants } = writableOrganization(context, 'organization.manage')
  if (world.apps.some((app) => app.ownerHandle === organization.handle)) {
    return fail(409, 'owns_apps', 'the organization still owns apps')
  }
  organization.archivedAt = new Date().toISOString()
  recordAudit(context, organization.handle, 'organization.archived', {
    kind: 'organization',
    id: organization.handle,
    label: organization.handle,
  })
  return ok(organizationView(organization, grants))
}

// ---------------------------------------------------------------- members

function listMembers(context: RequestContext): Reply {
  const organization = requireOrganizationMember(world, context.user, context.params.handle)
  return ok({ members: organization.members.map((member) => memberView(organization, member.userId)) })
}

function findMember(organization: StubOrganization, userId: string) {
  const member = organization.members.find((candidate) => candidate.userId === userId)
  if (member === undefined) {
    return fail(404, 'not_found', 'not a member')
  }
  return member
}

function setMemberGrants(context: RequestContext): Reply {
  const { organization, grants: callerGrants } = writableOrganization(context, 'members.manage')
  const member = findMember(organization, context.params.userId)
  const requested = parseGrants(jsonBody(context).grants)
  requireNoEscalation(callerGrants, member.grants, requested)
  requireMembersManagerRemains(organization, member.userId, requested)
  requireKnownApps(world, organization.handle, requested)
  member.grants = requested
  recordAudit(context, organization.handle, 'member.grants_changed', memberTarget(member.userId), {
    grants: requested,
  })
  return ok(memberView(organization, member.userId))
}

function memberTarget(userId: string): { kind: string; id: string; label: string } {
  const user = world.users.find((candidate) => candidate.id === userId)
  if (user === undefined) {
    return { kind: 'member', id: userId, label: userId }
  }
  return { kind: 'member', id: userId, label: user.displayName }
}

function removeMember(context: RequestContext): Reply {
  const userId = context.params.userId
  if (userId === context.user.id) {
    return leaveOrganization(context)
  }
  const { organization, grants: callerGrants } = writableOrganization(context, 'members.manage')
  const member = findMember(organization, userId)
  requireNoEscalation(callerGrants, member.grants, [])
  requireMembersManagerRemains(organization, userId, null)
  organization.members = organization.members.filter((candidate) => candidate.userId !== userId)
  recordAudit(context, organization.handle, 'member.removed', memberTarget(userId))
  return noContent()
}

/** Leaving needs no permission and works on archived organizations. */
function leaveOrganization(context: RequestContext): Reply {
  const organization = requireOrganizationMember(world, context.user, context.params.handle)
  requireMembersManagerRemains(organization, context.user.id, null)
  organization.members = organization.members.filter((candidate) => candidate.userId !== context.user.id)
  recordAudit(context, organization.handle, 'member.left', memberTarget(context.user.id))
  return noContent()
}

// ---------------------------------------------------------------- invitations

function listOrganizationInvitations(context: RequestContext): Reply {
  const organization = requireOrganizationMember(world, context.user, context.params.handle)
  requirePermission(requireVisibleOwner(world, context.user, organization.handle), 'members.manage')
  return ok({ invitations: organization.invitations.map(invitationView) })
}

function parseInvitee(body: Record<string, unknown>): { email?: string; contactCode?: string } {
  const email = typeof body.email === 'string' && body.email.trim() !== ''
  const contactCode = typeof body.contactCode === 'string' && body.contactCode.trim() !== ''
  if (email === contactCode) {
    return invalid('email', 'give either a valid email address or a contact code', 'invalid_invitee')
  }
  if (email) {
    return parseEmailInvitee(String(body.email).trim())
  }
  return parseContactCodeInvitee(String(body.contactCode).trim())
}

function parseEmailInvitee(email: string): { email: string } {
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return invalid('email', 'give either a valid email address or a contact code', 'invalid_invitee')
  }
  return { email: email.toLowerCase() }
}

function parseContactCodeInvitee(contactCode: string): { contactCode: string } {
  const known = world.users.some((user) => user.contactCode.toLowerCase() === contactCode.toLowerCase())
  if (!known) {
    return invalid('contactCode', 'no account has that contact code', 'unknown_contact_code')
  }
  return { contactCode }
}

function createInvitation(context: RequestContext): Reply {
  const { organization, grants: callerGrants } = writableOrganization(context, 'members.manage')
  const body = jsonBody(context)
  const invitee = parseInvitee(body)
  const grants = parseGrants(body.grants)
  requireKnownApps(world, organization.handle, grants)
  requireNoEscalation(callerGrants, [], grants)
  const invitation: StubInvitation = {
    id: newId('inv'),
    ...invitee,
    grants,
    invitedByUserId: context.user.id,
    createdAt: new Date().toISOString(),
    expiresAt: daysFromNow(14),
  }
  organization.invitations.push(invitation)
  recordAudit(context, organization.handle, 'invitation.created', {
    kind: 'invitation',
    id: invitation.id,
    label: String(invitee.email || invitee.contactCode),
  })
  return created(invitationView(invitation))
}

function revokeInvitation(context: RequestContext): Reply {
  const { organization } = writableOrganization(context, 'members.manage')
  const invitationId = context.params.id
  if (!organization.invitations.some((invitation) => invitation.id === invitationId)) {
    return fail(404, 'not_found', 'no such invitation')
  }
  organization.invitations = organization.invitations.filter((invitation) => invitation.id !== invitationId)
  recordAudit(context, organization.handle, 'invitation.revoked', { kind: 'invitation', id: invitationId, label: invitationId })
  return noContent()
}

function isAddressedTo(invitation: StubInvitation, user: StubUser): boolean {
  if (Date.parse(invitation.expiresAt) < Date.now()) {
    return false
  }
  const emailMatches = invitation.email !== undefined && invitation.email === user.email.toLowerCase()
  const codeMatches = invitation.contactCode !== undefined && invitation.contactCode.toLowerCase() === user.contactCode.toLowerCase()
  return emailMatches || codeMatches
}

function myInvitationEntries(user: StubUser): { organization: StubOrganization; invitation: StubInvitation }[] {
  const entries: { organization: StubOrganization; invitation: StubInvitation }[] = []
  for (const organization of world.organizations.filter((candidate) => candidate.archivedAt === null)) {
    for (const invitation of organization.invitations) {
      if (isAddressedTo(invitation, user)) {
        entries.push({ organization, invitation })
      }
    }
  }
  return entries
}

function listMyInvitations(context: RequestContext): Reply {
  const invitations = myInvitationEntries(context.user).map(({ organization, invitation }) => ({
    id: invitation.id,
    organization: ownerView(organization.handle),
    grants: invitation.grants,
    invitedBy: invitationView(invitation).invitedBy,
    expiresAt: invitation.expiresAt,
  }))
  return ok({ invitations })
}

function findMyInvitation(context: RequestContext) {
  const entry = myInvitationEntries(context.user).find(({ invitation }) => invitation.id === context.params.id)
  if (entry === undefined) {
    return fail(404, 'not_found', 'no such invitation')
  }
  return entry
}

function acceptInvitation(context: RequestContext): Reply {
  const { organization, invitation } = findMyInvitation(context)
  const alreadyMember = organization.members.some((member) => member.userId === context.user.id)
  if (alreadyMember) {
    return fail(409, 'already_member', 'already a member of this organization')
  }
  organization.members.push({ userId: context.user.id, joinedAt: new Date().toISOString(), grants: invitation.grants })
  organization.invitations = organization.invitations.filter((candidate) => candidate.id !== invitation.id)
  recordAudit(context, organization.handle, 'invitation.accepted', memberTarget(context.user.id))
  return noContent()
}

function declineInvitation(context: RequestContext): Reply {
  const { organization, invitation } = findMyInvitation(context)
  organization.invitations = organization.invitations.filter((candidate) => candidate.id !== invitation.id)
  recordAudit(context, organization.handle, 'invitation.declined', memberTarget(context.user.id))
  return noContent()
}

// ---------------------------------------------------------------- audit

function auditCursor(query: URLSearchParams): number {
  const before = query.get('before')
  if (before === null || before === '') {
    return Number.MAX_SAFE_INTEGER
  }
  const milliseconds = Date.parse(before)
  if (Number.isNaN(milliseconds)) {
    return fail(400, 'invalid_cursor', 'before is not a cursor from this endpoint')
  }
  return milliseconds
}

function listAudit(context: RequestContext): Reply {
  const organization = requireOrganizationMember(world, context.user, context.params.handle)
  requirePermission(requireVisibleOwner(world, context.user, organization.handle), 'audit.view')
  const limit = Math.min(200, Math.max(1, Number(context.query.get('limit')) || 50))
  const before = auditCursor(context.query)
  const older = organization.audit.filter((entry) => Date.parse(entry.at) < before)
  const entries = older.slice(0, limit)
  let nextCursor: string | null = null
  if (older.length > limit) {
    nextCursor = entries[entries.length - 1].at
  }
  return ok({ entries, nextCursor })
}

// ---------------------------------------------------------------- apps

function listOwnerApps(context: RequestContext): Reply {
  requireVisibleOwner(world, context.user, context.params.handle)
  const apps = world.apps.filter((app) => app.ownerHandle === context.params.handle)
  return ok({ apps: apps.map(appSummaryView) })
}

function parseAppType(value: unknown): 'public' | 'confidential' {
  if (value !== 'public' && value !== 'confidential') {
    return invalid('type', 'type must be public or confidential')
  }
  return value
}

function grantCreatorOnApp(organizationHandle: string, userId: string, appId: string): void {
  const organization = world.organizations.find((candidate) => candidate.handle === organizationHandle)
  const member = organization?.members.find((candidate) => candidate.userId === userId)
  if (member === undefined) {
    return
  }
  const missing = APP_PERMISSIONS.filter((permission) => !holds(member.grants, permission, appId))
  member.grants.push(...missing.map((permission) => ({ permission, appId })))
}

function generateSecret(): string {
  return `nws_${randomBytes(24).toString('hex')}`
}

function createApp(context: RequestContext): Reply {
  const ownerHandle = context.params.handle
  const grants = requireVisibleOwner(world, context.user, ownerHandle)
  requirePermission(grants, 'apps.create')
  const organization = world.organizations.find((candidate) => candidate.handle === ownerHandle)
  if (organization !== undefined) {
    requireActiveOrganization(organization)
  }
  const body = jsonBody(context)
  const type = parseAppType(body.type)
  const fields = parseAppFields(world, body, true)
  const now = new Date().toISOString()
  const app: StubApp = {
    id: newId('app'),
    ownerHandle,
    name: '',
    type,
    description: '',
    homepage: '',
    redirectUris: [],
    scopes: [],
    logo: null,
    review: { status: 'none', reason: null, updatedAt: null },
    createdAt: now,
    updatedAt: now,
    ...fields,
  }
  world.apps.push(app)
  grantCreatorOnApp(ownerHandle, context.user.id, app.id)
  recordAudit(context, ownerHandle, 'app.created', { kind: 'app', id: app.id, label: app.name })
  const appGrants = requireVisibleOwner(world, context.user, ownerHandle)
  const result: { app: unknown; clientSecret?: string } = { app: appView(app, appGrants, context.origin) }
  if (type === 'confidential') {
    result.clientSecret = generateSecret()
  }
  return created(result)
}

function getApp(context: RequestContext): Reply {
  const { app, grants } = requireVisibleApp(world, context.user, context.params.clientId)
  return ok(appView(app, grants, context.origin))
}

function patchApp(context: RequestContext): Reply {
  const { app, grants } = requireVisibleApp(world, context.user, context.params.clientId)
  requirePermission(grants, 'apps.edit', app.id)
  const body = jsonBody(context)
  if (body.type !== undefined) {
    return invalid('type', 'the type of an app cannot change')
  }
  const fields = parseAppFields(world, body, false)
  const before = { redirectUris: app.redirectUris, scopes: app.scopes.map((entry) => entry.scope) }
  Object.assign(app, fields, { updatedAt: new Date().toISOString() })
  const after = { redirectUris: app.redirectUris, scopes: app.scopes.map((entry) => entry.scope) }
  const target = { kind: 'app', id: app.id, label: app.name }
  if (JSON.stringify(before.redirectUris) !== JSON.stringify(after.redirectUris)) {
    recordAudit(context, app.ownerHandle, 'app.redirect_uris_changed', target, { before: before.redirectUris, after: after.redirectUris })
  }
  if (JSON.stringify(before.scopes) !== JSON.stringify(after.scopes)) {
    recordAudit(context, app.ownerHandle, 'app.scopes_changed', target, { before: before.scopes, after: after.scopes })
  }
  return ok(appView(app, grants, context.origin))
}

function rotateSecret(context: RequestContext): Reply {
  const { app, grants } = requireVisibleApp(world, context.user, context.params.clientId)
  requirePermission(grants, 'apps.secrets', app.id)
  if (app.type !== 'confidential') {
    return invalid('type', 'public apps have no client secret')
  }
  recordAudit(context, app.ownerHandle, 'app.secret_rotated', { kind: 'app', id: app.id, label: app.name })
  return ok({ clientSecret: generateSecret() })
}

function removeGrantsForApp(appId: string): void {
  for (const organization of world.organizations) {
    organization.members.forEach((member) => {
      member.grants = member.grants.filter((grant) => grant.appId !== appId)
    })
    organization.invitations.forEach((invitation) => {
      invitation.grants = invitation.grants.filter((grant) => grant.appId !== appId)
    })
  }
}

function deleteApp(context: RequestContext): Reply {
  const { app, grants } = requireVisibleApp(world, context.user, context.params.clientId)
  requirePermission(grants, 'apps.delete', app.id)
  world.apps = world.apps.filter((candidate) => candidate.id !== app.id)
  removeGrantsForApp(app.id)
  recordAudit(context, app.ownerHandle, 'app.deleted', { kind: 'app', id: app.id, label: app.name })
  return noContent()
}

function submitReview(context: RequestContext): Reply {
  const { app, grants } = requireVisibleApp(world, context.user, context.params.clientId)
  requirePermission(grants, 'apps.review', app.id)
  const body = jsonBody(context)
  const privacyPolicyUrl = parseText(body.privacyPolicyUrl, 'privacyPolicyUrl', 1, 300)
  if (!isHttpsUrl(privacyPolicyUrl)) {
    return invalid('privacyPolicyUrl', 'the privacy policy must be an https:// URL')
  }
  const supportContact = parseText(body.supportContact, 'supportContact', 1, 200)
  if (app.review.status !== 'none' && app.review.status !== 'rejected') {
    return fail(409, 'review_state', 'the app is already in review, approved or suspended')
  }
  app.privacyPolicyUrl = privacyPolicyUrl
  app.supportContact = supportContact
  app.review = { status: 'pending', reason: null, updatedAt: new Date().toISOString() }
  recordAudit(context, app.ownerHandle, 'app.review.submit', { kind: 'app', id: app.id, label: app.name })
  return ok(app.review)
}

const LOGO_CONTENT_TYPES = ['image/png', 'image/svg+xml']
const LOGO_MAXIMUM_BYTES = 1024 * 1024

function putLogo(context: RequestContext): Reply {
  const { app, grants } = requireVisibleApp(world, context.user, context.params.clientId)
  requirePermission(grants, 'apps.edit', app.id)
  const contentType = context.contentType.split(';')[0].trim()
  if (!LOGO_CONTENT_TYPES.includes(contentType)) {
    return invalid('logo', 'the logo must be a PNG or SVG')
  }
  if (context.rawBody.length === 0 || context.rawBody.length > LOGO_MAXIMUM_BYTES) {
    return invalid('logo', 'the logo must be between 1 byte and 1 MB')
  }
  app.logo = { bytes: context.rawBody, contentType }
  app.updatedAt = new Date().toISOString()
  return ok({ logoUrl: appView(app, grants, context.origin).logoUrl, held: app.logoHeld })
}

function deleteLogo(context: RequestContext): Reply {
  const { app, grants } = requireVisibleApp(world, context.user, context.params.clientId)
  requirePermission(grants, 'apps.edit', app.id)
  app.logo = null
  app.updatedAt = new Date().toISOString()
  return noContent()
}

function serveLogo(context: RequestContext): Reply {
  const app = findApp(world, context.params.clientId)
  if (app.logo === null) {
    return fail(404, 'not_found', 'no logo')
  }
  return { status: 200, binary: app.logo }
}

// ---------------------------------------------------------------- usage

function seededRandom(seed: string): () => number {
  let state = 0
  for (const character of seed) {
    state = (state * 31 + character.charCodeAt(0)) % 4294967296
  }
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

function usageSeries(clientId: string, days: number): UsagePoint[] {
  const random = seededRandom(clientId)
  const series: UsagePoint[] = []
  for (let index = 0; index < days; index += 1) {
    const authorizedUsers = 40 + index * 3 + Math.floor(random() * 6)
    series.push({
      date: daysFromNow(index - days + 1).slice(0, 10),
      authorizedUsers,
      activeInstalls: Math.floor(authorizedUsers * 0.7),
      requests: 800 + index * 20 + Math.floor(random() * 600),
      rateLimited: Math.floor(random() * 12),
    })
  }
  return series
}

function getUsage(context: RequestContext): Reply {
  const { app, grants } = requireVisibleApp(world, context.user, context.params.clientId)
  requirePermission(grants, 'usage.view', app.id)
  const days = Math.min(90, Math.max(1, Number(context.query.get('days')) || 30))
  const series = usageSeries(app.id, days)
  const last = series[series.length - 1]
  const totals = {
    authorizedUsers: last.authorizedUsers,
    activeInstalls: last.activeInstalls,
    storageBytes: 1_250_000 * last.authorizedUsers,
    requests: series.reduce((sum, point) => sum + point.requests, 0),
    rateLimited: series.reduce((sum, point) => sum + point.rateLimited, 0),
  }
  return ok({ totals, series })
}

// ---------------------------------------------------------------- schemas

function listSchemas(context: RequestContext): Reply {
  const scope = context.query.get('scope')
  const schemas = world.schemas.filter((schema) => scope === null || schema.scope === scope)
  return ok({ schemas })
}

/** What the user may do for the owner of a scope; nothing when they cannot act for it. */
function grantsOrNone(user: StubUser, scope: string): Grant[] {
  const grants = grantsFor(world, user, scope)
  if (grants === null) {
    return []
  }
  return grants
}

function listPublishes(context: RequestContext): Reply {
  const { scope, name } = context.params
  const known = world.schemas.some((schema) => schema.scope === scope && schema.name === name)
  if (!known) {
    return fail(404, 'not_found', `no schema @${scope}/${name}`)
  }
  requirePermission(grantsOrNone(context.user, scope), 'schemas.publish')
  const publishes = world.publishes.get(`${scope}/${name}`)
  if (publishes === undefined) {
    return ok({ publishes: [] })
  }
  return ok({ publishes })
}

// ---------------------------------------------------------------- domains

function findDomain(handle: string, domain: string): OwnerDomain {
  const found = ownerDomains(handle).find((entry) => entry.domain === domain)
  if (found === undefined) {
    return fail(404, 'not_found', `${domain} is not one of ${handle}'s domains`)
  }
  return found
}

function requireDomainsManager(context: RequestContext): void {
  const grants = requireVisibleOwner(world, context.user, context.params.handle)
  requirePermission(grants, 'domains.manage')
}

function listDomains(context: RequestContext): Reply {
  requireVisibleOwner(world, context.user, context.params.handle)
  return ok({ domains: ownerDomains(context.params.handle) })
}

function addDomain(context: RequestContext): Reply {
  requireDomainsManager(context)
  const handle = context.params.handle
  const body = jsonBody(context)
  const domain = parseDomain(body.domain)
  const method = parseVerificationMethod(body.method)
  if (ownerDomains(handle).some((entry) => entry.domain === domain)) {
    return fail(409, 'domain_exists', `${domain} was already added`, 'domain')
  }
  const entry: OwnerDomain = {
    domain,
    method,
    token: `neoworks-verify=${randomBytes(8).toString('hex')}`,
    verified: false,
    verifiedAt: null,
    lastCheckedAt: null,
  }
  world.domains.set(handle, [...ownerDomains(handle), entry])
  recordAudit(context, handle, 'domain.add', { kind: 'domain', id: domain, label: domain })
  return created(entry)
}

function verifyDomain(context: RequestContext): Reply {
  requireDomainsManager(context)
  const entry = findDomain(context.params.handle, context.params.domain)
  const now = new Date().toISOString()
  entry.lastCheckedAt = now
  if (domainProofPasses(entry.domain)) {
    entry.verified = true
    entry.verifiedAt = now
  }
  recordAudit(context, context.params.handle, 'domain.verify', { kind: 'domain', id: entry.domain, label: entry.domain })
  return ok(entry)
}

function removeDomain(context: RequestContext): Reply {
  requireDomainsManager(context)
  const handle = context.params.handle
  findDomain(handle, context.params.domain)
  world.domains.set(handle, ownerDomains(handle).filter((entry) => entry.domain !== context.params.domain))
  recordAudit(context, handle, 'domain.remove', { kind: 'domain', id: context.params.domain, label: context.params.domain })
  return noContent()
}

// ---------------------------------------------------------------- misc

function userinfo(context: RequestContext): Reply {
  const { user } = context
  return ok({ sub: user.id, email: user.email, name: user.displayName, created_at: user.createdAt })
}

function listInstalls(): Reply {
  return ok({ installs: [] })
}

function resetWorld(): Reply {
  world = seedWorld()
  return noContent()
}

// ---------------------------------------------------------------- routing

function route(method: string, path: string, handler: Handler, isPublic = false): Route {
  const parameterNames: string[] = []
  const source = path.replace(/:([a-zA-Z]+)/g, (_match, name: string) => {
    parameterNames.push(name)
    return '([^/]+)'
  })
  return { method, pattern: new RegExp(`^${source}$`), parameterNames, isPublic, handler }
}

const ORGANIZATION = '/api/v1/organizations/:handle'
const OWNER = '/api/v1/owners/:handle'

const routes: Route[] = [
  route('GET', '/api/v1/me/handle', getMyHandle),
  route('PUT', '/api/v1/me/handle', putMyHandle),
  route('GET', '/api/v1/handles/:handle/availability', handleAvailability),
  route('GET', '/api/v1/me/owners', myOwners),
  route('POST', '/api/v1/organizations', createOrganization),
  route('GET', ORGANIZATION, getOrganization),
  route('PATCH', ORGANIZATION, patchOrganization),
  route('POST', `${ORGANIZATION}/archive`, archiveOrganization),
  route('GET', `${ORGANIZATION}/members`, listMembers),
  route('PUT', `${ORGANIZATION}/members/:userId/grants`, setMemberGrants),
  route('DELETE', `${ORGANIZATION}/members/:userId`, removeMember),
  route('GET', `${ORGANIZATION}/invitations`, listOrganizationInvitations),
  route('POST', `${ORGANIZATION}/invitations`, createInvitation),
  route('DELETE', `${ORGANIZATION}/invitations/:id`, revokeInvitation),
  route('GET', '/api/v1/me/invitations', listMyInvitations),
  route('POST', '/api/v1/me/invitations/:id/accept', acceptInvitation),
  route('POST', '/api/v1/me/invitations/:id/decline', declineInvitation),
  route('GET', `${ORGANIZATION}/audit`, listAudit),
  route('GET', `${OWNER}/apps`, listOwnerApps),
  route('POST', `${OWNER}/apps`, createApp),
  route('GET', '/api/v1/apps/:clientId', getApp),
  route('PATCH', '/api/v1/apps/:clientId', patchApp),
  route('POST', '/api/v1/apps/:clientId/secret', rotateSecret),
  route('DELETE', '/api/v1/apps/:clientId', deleteApp),
  route('POST', '/api/v1/apps/:clientId/review', submitReview),
  route('PUT', '/api/v1/apps/:clientId/logo', putLogo),
  route('DELETE', '/api/v1/apps/:clientId/logo', deleteLogo),
  route('GET', '/api/v1/apps/:clientId/usage', getUsage),
  route('GET', '/api/v1/schemas', listSchemas, true),
  route('GET', '/api/v1/schemas/:scope/:name/publishes', listPublishes),
  route('GET', `${OWNER}/domains`, listDomains),
  route('POST', `${OWNER}/domains`, addDomain),
  route('POST', `${OWNER}/domains/:domain/verify`, verifyDomain),
  route('DELETE', `${OWNER}/domains/:domain`, removeDomain),
  route('GET', '/oauth/userinfo', userinfo),
  route('GET', '/api/v1/installs', listInstalls),
  ...platformRoutes(route),
  route('GET', '/logos/:clientId', serveLogo, true),
  route('POST', '/__reset', resetWorld, true),
]

function matchRoute(method: string, pathname: string): { route: Route; params: Record<string, string> } | null {
  for (const candidate of routes) {
    const match = candidate.pattern.exec(pathname)
    if (candidate.method === method && match !== null) {
      const params: Record<string, string> = {}
      candidate.parameterNames.forEach((name, index) => {
        params[name] = decodeURIComponent(match[index + 1])
      })
      return { route: candidate, params }
    }
  }
  return null
}

function authenticate(headers: Headers): StubUser | null {
  const token = (headers.get('authorization') || '').replace(/^Bearer /i, '')
  return world.users.find((user) => user.token === token) || null
}

interface IncomingRequest {
  method: string
  url: URL
  headers: Headers
  rawBody: Buffer
  origin: string
}

function dispatch(incoming: IncomingRequest): Reply {
  const matched = matchRoute(incoming.method, incoming.url.pathname)
  if (matched === null) {
    return fail(404, 'not_found', `no route for ${incoming.method} ${incoming.url.pathname}`)
  }
  const user = authenticate(incoming.headers)
  if (user === null && !matched.route.isPublic) {
    return fail(401, 'invalid_token', 'sign in to continue')
  }
  const context = {
    world,
    user: user as StubUser,
    params: matched.params,
    query: incoming.url.searchParams,
    rawBody: incoming.rawBody,
    contentType: incoming.headers.get('content-type') || '',
    origin: incoming.origin,
  }
  return matched.route.handler(context)
}

function safeDispatch(incoming: IncomingRequest): Reply {
  try {
    return dispatch(incoming)
  } catch (error) {
    if (!(error instanceof StubError)) {
      throw error
    }
    return {
      status: error.status,
      body: { error: error.code, message: error.message, field: error.field, permission: error.permission },
    }
  }
}

async function readBody(incoming: AsyncIterable<Buffer>): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of incoming) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

const port = Number(process.env.DEVELOPER_API_STUB_PORT || 4310)

createServer(async (request, response) => {
  const host = request.headers.host || `127.0.0.1:${port}`
  const incoming: IncomingRequest = {
    method: request.method || 'GET',
    url: new URL(request.url || '/', `http://${host}`),
    headers: new Headers(request.headers as Record<string, string>),
    rawBody: await readBody(request),
    origin: `http://${host}`,
  }
  const reply = safeDispatch(incoming)
  if (reply.binary !== undefined) {
    response.writeHead(reply.status, { 'Content-Type': reply.binary.contentType })
    response.end(reply.binary.bytes)
    return
  }
  response.writeHead(reply.status, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify(reply.body))
}).listen(port, '127.0.0.1', () => {
  console.log(`developer API stub listening on http://127.0.0.1:${port}`)
})

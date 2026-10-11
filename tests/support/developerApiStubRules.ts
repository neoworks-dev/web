import type { AppFields, Grant, Permission, RequestedScope } from '@neoworks-dev/sdk'
import {
  ALL_PERMISSIONS,
  APP_PERMISSIONS,
  ORGANIZATION_PERMISSIONS,
  organizationWide,
  type StubApp,
  type StubOrganization,
  type StubUser,
  type World,
} from './developerApiStubWorld.ts'

// Permission and validation rules of the developer REST contract (issues #29,
// #25, #39). Every failure is a StubError, which the server renders as
// `{ error, message, field? }`.

export class StubError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly field?: string,
    readonly permission?: Permission,
  ) {
    super(message)
  }
}

export function fail(status: number, code: string, message: string, field?: string, permission?: Permission): never {
  throw new StubError(status, code, message, field, permission)
}

export function invalid(field: string, message: string, code = 'invalid_request'): never {
  return fail(400, code, message, field)
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// ---------------------------------------------------------------- handles

const HANDLE_PATTERN = /^[a-z0-9][a-z0-9-]*$/
const RESERVED_HANDLES = [
  'openschema', 'admin', 'administrator', 'api', 'www', 'oauth', 'vault', 'auth', 'login', 'signup', 'settings',
  'dashboard', 'developer', 'developers', 'support', 'help', 'security', 'root', 'system', 'official',
]

export type HandleProblem = 'invalid' | 'reserved' | 'taken' | null

export function handleProblem(world: World, handle: string): HandleProblem {
  if (handle.length < 2 || handle.length > 39 || !HANDLE_PATTERN.test(handle)) {
    return 'invalid'
  }
  if (handle.startsWith('neoworks') || RESERVED_HANDLES.includes(handle)) {
    return 'reserved'
  }
  const takenByUser = world.users.some((user) => user.handle === handle)
  const takenByOrganization = world.organizations.some((organization) => organization.handle === handle)
  if (takenByUser || takenByOrganization) {
    return 'taken'
  }
  return null
}

const INVALID_HANDLE_MESSAGE = '2 to 39 lowercase letters, digits or hyphens, starting with a letter or digit'

/** A handle that may be claimed. Without `checkTaken`, only its form and reservation are checked. */
export function parseHandle(world: World, value: unknown, checkTaken = true): string {
  const handle = parseText(value, 'handle', 0, 100)
  const problem = handleProblem(world, handle)
  if (problem === 'invalid') {
    return invalid('handle', INVALID_HANDLE_MESSAGE, 'invalid_handle')
  }
  if (problem === 'reserved') {
    return fail(409, 'handle_taken', 'that handle is reserved', 'handle')
  }
  if (problem === 'taken' && checkTaken) {
    return fail(409, 'handle_taken', 'that handle is taken', 'handle')
  }
  return handle
}

export function parseDisplayName(value: unknown): string {
  if (typeof value !== 'string' || value.trim() === '' || value.trim().length > 100) {
    return invalid('displayName', '1 to 100 characters', 'invalid_display_name')
  }
  return value.trim()
}

// ---------------------------------------------------------------- reach

export function holds(grants: Grant[], permission: Permission, appId: string | null): boolean {
  return grants.some((grant) => {
    if (grant.permission !== permission) {
      return false
    }
    return grant.appId === null || grant.appId === appId
  })
}

/** The grants the user acts with for an owner, or null when they may not even see it. */
export function grantsFor(world: World, user: StubUser, ownerHandle: string): Grant[] | null {
  if (user.handle === ownerHandle) {
    return organizationWide(ALL_PERMISSIONS)
  }
  const organization = world.organizations.find((candidate) => candidate.handle === ownerHandle)
  if (organization === undefined) {
    return null
  }
  const member = organization.members.find((candidate) => candidate.userId === user.id)
  if (member === undefined) {
    return null
  }
  return member.grants
}

export function requireVisibleOwner(world: World, user: StubUser, ownerHandle: string): Grant[] {
  const grants = grantsFor(world, user, ownerHandle)
  if (grants === null) {
    return fail(404, 'not_found', `no owner named ${ownerHandle}`)
  }
  return grants
}

export function requirePermission(grants: Grant[], permission: Permission, appId: string | null = null): void {
  if (!holds(grants, permission, appId)) {
    fail(403, 'missing_permission', `this needs the ${permission} permission`, undefined, permission)
  }
}

export function findOrganization(world: World, handle: string): StubOrganization {
  const organization = world.organizations.find((candidate) => candidate.handle === handle)
  if (organization === undefined) {
    return fail(404, 'not_found', `no organization named ${handle}`)
  }
  return organization
}

export function requireOrganizationMember(world: World, user: StubUser, handle: string): StubOrganization {
  const organization = findOrganization(world, handle)
  requireVisibleOwner(world, user, handle)
  return organization
}

export function requireActiveOrganization(organization: StubOrganization): void {
  if (organization.archivedAt !== null) {
    fail(409, 'archived', 'the organization is archived')
  }
}

export function findApp(world: World, clientId: string): StubApp {
  const app = world.apps.find((candidate) => candidate.id === clientId)
  if (app === undefined) {
    return fail(404, 'not_found', `no app ${clientId}`)
  }
  return app
}

/** The app together with the caller's grants on its owner; 404 unless the caller can see the owner. */
export function requireVisibleApp(world: World, user: StubUser, clientId: string): { app: StubApp; grants: Grant[] } {
  const app = findApp(world, clientId)
  const grants = requireVisibleOwner(world, user, app.ownerHandle)
  return { app, grants }
}

export function appPermissionsFor(grants: Grant[], appId: string): Permission[] {
  return APP_PERMISSIONS.filter((permission) => holds(grants, permission, appId))
}

// ---------------------------------------------------------------- grants

function knownPermission(value: unknown): value is Permission {
  return typeof value === 'string' && (ALL_PERMISSIONS as string[]).includes(value)
}

const INVALID_GRANT_MESSAGE = 'a grant names an unknown permission or a reach it does not allow'

function parseGrant(value: unknown): Grant {
  if (!isRecord(value) || !knownPermission(value.permission)) {
    return fail(400, 'invalid_grant', INVALID_GRANT_MESSAGE)
  }
  const permission = value.permission
  if (value.appId === null || value.appId === undefined) {
    return { permission, appId: null }
  }
  if (typeof value.appId !== 'string' || value.appId === '' || ORGANIZATION_PERMISSIONS.includes(permission)) {
    return fail(400, 'invalid_grant', INVALID_GRANT_MESSAGE)
  }
  return { permission, appId: value.appId }
}

/** True when holding `held` includes `wanted`: same permission at the same or a wider reach. */
function covers(held: Grant, wanted: Grant): boolean {
  if (held.permission !== wanted.permission) {
    return false
  }
  if (held.appId === null) {
    return true
  }
  return wanted.appId === held.appId
}

function coveredBy(grants: Grant[], wanted: Grant): boolean {
  return grants.some((grant) => covers(grant, wanted))
}

/** Drops duplicates and grants a wider grant already covers. */
export function normalizeGrants(grants: Grant[]): Grant[] {
  return grants.filter((grant, index) => {
    return !grants.some((other, otherIndex) => {
      if (otherIndex === index || !covers(other, grant)) {
        return false
      }
      return !covers(grant, other) || otherIndex < index
    })
  })
}

export function parseGrants(value: unknown): Grant[] {
  if (!Array.isArray(value)) {
    return fail(400, 'invalid_grant', 'grants must be a list')
  }
  return normalizeGrants(value.map(parseGrant))
}

/** Per-app grants must name an app the organization owns. */
export function requireKnownApps(world: World, organizationHandle: string, grants: Grant[]): void {
  const owned = (appId: string) => world.apps.some((app) => app.id === appId && app.ownerHandle === organizationHandle)
  const unknown = grants.find((grant) => grant.appId !== null && !owned(grant.appId))
  if (unknown !== undefined) {
    invalid('grants', `no app ${unknown.appId} in this organization`, 'unknown_app')
  }
}

function describeReach(grant: Grant): string {
  if (grant.appId === null) {
    return 'organization-wide'
  }
  return `for ${grant.appId}`
}

/** A caller may only grant or remove a permission they hold at the same or a wider reach. */
export function requireNoEscalation(callerGrants: Grant[], before: Grant[], after: Grant[]): void {
  const added = after.filter((grant) => !coveredBy(before, grant))
  const removed = before.filter((grant) => !coveredBy(after, grant))
  const escalating = [...added, ...removed].find((grant) => !coveredBy(callerGrants, grant))
  if (escalating === undefined) {
    return
  }
  fail(
    403,
    'escalation',
    `you can only grant or remove permissions you hold, at the same or a wider reach (${escalating.permission} ${describeReach(escalating)})`,
  )
}

function managesMembers(grants: Grant[]): boolean {
  return grants.some((grant) => grant.permission === 'members.manage' && grant.appId === null)
}

/** At least one member must always hold members.manage. `nextGrants` null means the member is removed. */
export function requireMembersManagerRemains(organization: StubOrganization, userId: string, nextGrants: Grant[] | null): void {
  const others = organization.members.filter((member) => member.userId !== userId)
  const otherManagers = others.filter((member) => managesMembers(member.grants))
  if (otherManagers.length > 0) {
    return
  }
  if (nextGrants !== null && managesMembers(nextGrants)) {
    return
  }
  fail(409, 'last_members_manager', 'the organization needs at least one member with members.manage')
}

// ---------------------------------------------------------------- app fields

const CUSTOM_SCHEME_PATTERN = /^[a-z][a-z0-9-]*(\.[a-z0-9-]+)+:\/\/\S*$/
const LOOPBACK_PATTERN = /^http:\/\/(127\.0\.0\.1|localhost):(\d{1,5})(\/\S*)?$/
const MAX_PORT = 65535
const COLLECTION_SCOPE_PATTERN = /^@([a-z0-9][a-z0-9._-]{0,63})\/([a-z0-9][a-z0-9._-]{0,63}):(read|write|share)$/
const IDENTITY_SCOPES = ['openid', 'profile', 'email']

export function isHttpsUrl(value: string): boolean {
  if (!value.startsWith('https://')) {
    return false
  }
  try {
    return new URL(value).hostname !== ''
  } catch {
    return false
  }
}

function isLoopbackUri(uri: string): boolean {
  const match = LOOPBACK_PATTERN.exec(uri)
  if (match === null) {
    return false
  }
  const port = Number(match[2])
  return port >= 1 && port <= MAX_PORT
}

export function isValidRedirectUri(uri: string): boolean {
  return isHttpsUrl(uri) || isLoopbackUri(uri) || CUSTOM_SCHEME_PATTERN.test(uri)
}

function lengthRange(minimum: number, maximum: number): string {
  if (minimum === 0) {
    return `at most ${maximum}`
  }
  return `between ${minimum} and ${maximum}`
}

function parseText(value: unknown, field: string, minimum: number, maximum: number): string {
  if (typeof value !== 'string') {
    return invalid(field, `${field} must be text`)
  }
  const text = value.trim()
  if (text.length < minimum || text.length > maximum) {
    return invalid(field, `${field} must be ${lengthRange(minimum, maximum)} characters`)
  }
  return text
}

function parseHomepage(value: unknown): string {
  const homepage = parseText(value, 'homepage', 0, 200)
  if (homepage !== '' && !isHttpsUrl(homepage)) {
    return invalid('homepage', 'homepage must be an https:// URL')
  }
  return homepage
}

function parseRedirectUris(value: unknown): string[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 10) {
    return invalid('redirectUris', 'provide between 1 and 10 redirect URIs')
  }
  const uris = value.map((entry) => parseText(entry, 'redirectUris', 1, 300))
  const rejected = uris.find((uri) => !isValidRedirectUri(uri))
  if (rejected !== undefined) {
    return invalid(
      'redirectUris',
      `${rejected} is not allowed: use https://, http://localhost:<port>, http://127.0.0.1:<port> or a reverse-domain scheme such as com.example.app://`,
    )
  }
  if (new Set(uris).size !== uris.length) {
    return invalid('redirectUris', 'redirect URIs must be unique')
  }
  return uris
}

function parseScope(world: World, value: unknown): RequestedScope {
  if (!isRecord(value) || typeof value.scope !== 'string') {
    return invalid('scopes', 'every scope needs a scope string and a reason')
  }
  const scope = value.scope
  const reason = parseText(value.reason, 'scopes', 1, 280)
  if (IDENTITY_SCOPES.includes(scope)) {
    return { scope, reason }
  }
  const match = COLLECTION_SCOPE_PATTERN.exec(scope)
  if (match === null) {
    return invalid('scopes', `${scope} is not openid, profile, email or @scope/name:read|write|share`)
  }
  const published = world.schemas.some((schema) => schema.scope === match[1] && schema.name === match[2])
  if (!published) {
    return invalid('scopes', `@${match[1]}/${match[2]} is not published in the registry`, 'unknown_collection')
  }
  return { scope, reason }
}

function parseScopes(world: World, value: unknown): RequestedScope[] {
  if (!Array.isArray(value) || value.length > 40) {
    return invalid('scopes', 'scopes must be a list of at most 40 entries')
  }
  const scopes = value.map((entry) => parseScope(world, entry))
  if (new Set(scopes.map((entry) => entry.scope)).size !== scopes.length) {
    return invalid('scopes', 'each scope can only be requested once')
  }
  return scopes
}

const REQUIRED_ON_CREATE: (keyof AppFields)[] = ['name', 'redirectUris']
const DEFAULTS_ON_CREATE = { description: '', homepage: '', scopes: [] }

/** Validates the app fields present in `body`; with `creating`, the required ones must be present. */
export function parseAppFields(world: World, body: Record<string, unknown>, creating: boolean): Partial<AppFields> {
  const parsers: Record<keyof AppFields, (value: unknown) => unknown> = {
    name: (value) => parseText(value, 'name', 1, 60),
    description: (value) => parseText(value, 'description', 0, 280),
    homepage: parseHomepage,
    redirectUris: parseRedirectUris,
    scopes: (value) => parseScopes(world, value),
  }
  const fields: Record<string, unknown> = {}
  for (const key of Object.keys(parsers) as (keyof AppFields)[]) {
    if (body[key] !== undefined) {
      fields[key] = parsers[key](body[key])
    } else if (creating && REQUIRED_ON_CREATE.includes(key)) {
      invalid(key, `${key} is required`)
    }
  }
  if (creating) {
    return { ...DEFAULTS_ON_CREATE, ...fields }
  }
  return fields
}

// ---------------------------------------------------------------- domains

const DOMAIN_PATTERN = /^(?=.{4,253}$)([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/

export function parseDomain(value: unknown): string {
  const domain = parseText(value, 'domain', 1, 253).toLowerCase()
  if (!DOMAIN_PATTERN.test(domain)) {
    return invalid('domain', 'enter a domain such as example.com, without scheme, port or path')
  }
  return domain
}

export function parseVerificationMethod(value: unknown): 'dns' | 'wellKnown' {
  if (value !== 'dns' && value !== 'wellKnown') {
    return invalid('method', 'method must be dns or wellKnown')
  }
  return value
}

/** The stub proves a domain unless its name starts with `unverified.`. */
export function domainProofPasses(domain: string): boolean {
  return !domain.startsWith('unverified.')
}

export { parseText }

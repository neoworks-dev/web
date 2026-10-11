import type {
  AppReview,
  AppType,
  AuditEntry,
  Grant,
  Owner,
  OwnerDomain,
  Permission,
  PublishAttempt,
  RegistrySchema,
  RequestedScope,
  ReviewStatus,
} from '@neoworks-dev/platform'

// In-memory data behind the developer API stub, plus the seeded fixtures the
// dashboard e2e tests and local UI work rely on.

export const ORGANIZATION_PERMISSIONS: Permission[] = [
  'organization.manage',
  'members.manage',
  'domains.manage',
  'apps.create',
  'schemas.publish',
  'audit.view',
]
export const APP_PERMISSIONS: Permission[] = ['apps.edit', 'apps.secrets', 'apps.delete', 'apps.review', 'usage.view']
export const ALL_PERMISSIONS: Permission[] = [...ORGANIZATION_PERMISSIONS, ...APP_PERMISSIONS]

export interface StubUser {
  id: string
  token: string
  handle: string | null
  displayName: string
  email: string
  contactCode: string
  createdAt: string
}

export interface StubMember {
  userId: string
  joinedAt: string
  grants: Grant[]
}

export interface StubInvitation {
  id: string
  email?: string
  contactCode?: string
  grants: Grant[]
  invitedByUserId: string
  createdAt: string
  expiresAt: string
}

export interface StubOrganization {
  handle: string
  displayName: string
  createdAt: string
  archivedAt: string | null
  /** Marked as reviewed and verified by a Neoworks administrator. */
  neoworksVerified: boolean
  members: StubMember[]
  invitations: StubInvitation[]
  audit: AuditEntry[]
}

export interface StubLogo {
  bytes: Buffer
  contentType: string
}

export interface StubApp {
  id: string
  ownerHandle: string
  name: string
  type: AppType
  description: string
  homepage: string
  redirectUris: string[]
  scopes: RequestedScope[]
  logo: StubLogo | null
  logoHeld: boolean
  review: AppReview
  rateLimitMultiplier: number | null
  privacyPolicyUrl: string
  supportContact: string
  createdAt: string
  updatedAt: string
}

/** An app the signed-in user authorized, as the connected-apps page lists it. */
export interface StubConnection {
  clientId: string
  name: string
  description: string
  ownerHandle: string | null
  verified: boolean
  firstParty: boolean
  reviewStatus: ReviewStatus
  reviewReason: string | null
  logoUrl: string | null
  scopes: string[]
  authorizedAt: string
  installs: { id: string; name: string; createdAt: string; revokedAt: string | null }[]
  usedBytes: number
  capBytes: number | null
}

export interface World {
  users: StubUser[]
  /** Users who may use the admin routes. */
  administratorIds: string[]
  connections: StubConnection[]
  storageQuotaBytes: number
  organizations: StubOrganization[]
  apps: StubApp[]
  domains: Map<string, OwnerDomain[]>
  schemas: RegistrySchema[]
  publishes: Map<string, PublishAttempt[]>
  nextId: number
}

export const SIGNED_IN_TOKEN = 'stub-token-moritz'
export const NEWCOMER_TOKEN = 'stub-token-newcomer'
export const REVIEWER_TOKEN = 'stub-token-reviewer'

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000

export function daysFromNow(days: number): string {
  return new Date(Date.now() + days * DAY_IN_MILLISECONDS).toISOString()
}

export function organizationWide(permissions: Permission[]): Grant[] {
  return permissions.map((permission) => ({ permission, appId: null }))
}

function seedUsers(): StubUser[] {
  const createdAt = daysFromNow(-200)
  return [
    { id: 'user-moritz', token: SIGNED_IN_TOKEN, handle: 'moritz', displayName: 'Moritz Utcke', email: 'moritz.utcke@gmx.de', contactCode: 'MOR-1001', createdAt },
    { id: 'user-newcomer', token: NEWCOMER_TOKEN, handle: null, displayName: 'New Comer', email: 'newcomer@example.com', contactCode: 'NEW-1002', createdAt },
    { id: 'user-alice', token: 'stub-token-alice', handle: 'alice', displayName: 'Alice Example', email: 'alice@acme.example', contactCode: 'ALI-1003', createdAt },
    { id: 'user-bob', token: 'stub-token-bob', handle: 'bob', displayName: 'Bob Builder', email: 'bob@acme.example', contactCode: 'BOB-1004', createdAt },
    { id: 'user-carol', token: 'stub-token-carol', handle: 'carol', displayName: 'Carol Ledger', email: 'carol@globex.example', contactCode: 'CAR-1005', createdAt },
    { id: 'user-dana', token: 'stub-token-dana', handle: 'dana', displayName: 'Dana Initech', email: 'dana@initech.example', contactCode: 'DAN-1006', createdAt },
    { id: 'user-reviewer', token: REVIEWER_TOKEN, handle: 'reviewer', displayName: 'Rita Reviewer', email: 'rita@neoworks.example', contactCode: 'RIT-1007', createdAt },
  ]
}

function seededAudit(): AuditEntry[] {
  const actor: Owner = { handle: 'moritz', kind: 'user', displayName: 'Moritz Utcke', verified: false }
  return [
    { id: 'seed-3', at: daysFromNow(-20), actor, action: 'domain.verify', target: { kind: 'domain', id: 'acme.example', label: 'acme.example' }, details: {} },
    { id: 'seed-2', at: daysFromNow(-40), actor, action: 'app.created', target: { kind: 'app', id: 'app_acme_recipes', label: 'Recipes' }, details: {} },
    { id: 'seed-1', at: daysFromNow(-150), actor, action: 'organization.created', target: { kind: 'organization', id: 'acme', label: 'Acme Inc' }, details: {} },
  ]
}

function seedOrganizations(): StubOrganization[] {
  const joinedAt = daysFromNow(-120)
  const maintainer = organizationWide(['apps.create', 'schemas.publish', 'apps.edit', 'apps.secrets', 'apps.review', 'usage.view'])
  const acme: StubOrganization = {
    handle: 'acme',
    displayName: 'Acme Inc',
    createdAt: daysFromNow(-150),
    archivedAt: null,
    neoworksVerified: false,
    members: [
      { userId: 'user-moritz', joinedAt, grants: organizationWide(ALL_PERMISSIONS) },
      { userId: 'user-alice', joinedAt, grants: maintainer },
      { userId: 'user-bob', joinedAt, grants: organizationWide(['usage.view']) },
    ],
    invitations: [],
    audit: seededAudit(),
  }
  const globex: StubOrganization = {
    handle: 'globex',
    displayName: 'Globex Corporation',
    createdAt: daysFromNow(-90),
    archivedAt: null,
    neoworksVerified: false,
    members: [
      {
        userId: 'user-moritz',
        joinedAt,
        grants: [
          { permission: 'members.manage', appId: null },
          { permission: 'apps.edit', appId: 'app_globex_ledger' },
          { permission: 'usage.view', appId: 'app_globex_ledger' },
        ],
      },
      { userId: 'user-carol', joinedAt, grants: organizationWide(['usage.view']) },
    ],
    invitations: [],
    audit: [],
  }
  const initech: StubOrganization = {
    handle: 'initech',
    displayName: 'Initech',
    createdAt: daysFromNow(-60),
    archivedAt: null,
    neoworksVerified: false,
    members: [{ userId: 'user-dana', joinedAt, grants: organizationWide(ALL_PERMISSIONS) }],
    invitations: [
      {
        id: 'inv_initech_moritz',
        email: 'moritz.utcke@gmx.de',
        grants: organizationWide(['usage.view', 'apps.edit']),
        invitedByUserId: 'user-dana',
        createdAt: daysFromNow(-2),
        expiresAt: daysFromNow(12),
      },
    ],
    audit: [],
  }
  return [acme, globex, initech]
}

function seedApp(fields: Partial<StubApp> & Pick<StubApp, 'id' | 'ownerHandle' | 'name' | 'type'>): StubApp {
  return {
    description: '',
    homepage: '',
    redirectUris: [],
    scopes: [],
    logo: null,
    logoHeld: false,
    review: { status: 'none', reason: null, updatedAt: null },
    rateLimitMultiplier: null,
    privacyPolicyUrl: '',
    supportContact: '',
    createdAt: daysFromNow(-40),
    updatedAt: daysFromNow(-10),
    ...fields,
  }
}

function seedApps(): StubApp[] {
  return [
    seedApp({
      id: 'app_moritz_notes',
      ownerHandle: 'moritz',
      name: 'Notes',
      type: 'public',
      description: 'Quick personal notes.',
      homepage: 'https://notes.moritz.example',
      redirectUris: ['http://localhost:5173/auth/callback'],
      scopes: [{ scope: 'openid', reason: 'Sign the user in' }],
    }),
    seedApp({
      id: 'app_acme_recipes',
      ownerHandle: 'acme',
      name: 'Recipes',
      type: 'confidential',
      description: 'Recipe collections for families.',
      homepage: 'https://recipes.acme.example',
      redirectUris: ['https://recipes.acme.example/callback'],
      scopes: [
        { scope: 'openid', reason: 'Sign the user in' },
        { scope: '@acme/recipes:read', reason: 'Show saved recipes' },
      ],
      review: { status: 'approved', reason: null, updatedAt: daysFromNow(-20) },
    }),
    seedApp({
      id: 'app_acme_planner',
      ownerHandle: 'acme',
      name: 'Planner',
      type: 'public',
      description: 'Weekly meal planner.',
      homepage: 'https://planner.acme.example',
      redirectUris: ['https://planner.elsewhere.example/callback'],
      scopes: [{ scope: 'profile', reason: 'Greet the user by name' }],
      review: { status: 'rejected', reason: 'The privacy policy does not mention data deletion.', updatedAt: daysFromNow(-5) },
    }),
    seedApp({
      id: 'app_globex_ledger',
      ownerHandle: 'globex',
      name: 'Ledger',
      type: 'confidential',
      description: 'Accounting for small teams.',
      homepage: 'https://ledger.globex.example',
      redirectUris: ['https://ledger.globex.example/callback'],
      scopes: [{ scope: 'email', reason: 'Send invoices' }],
    }),
    seedApp({
      id: 'app_globex_dash',
      ownerHandle: 'globex',
      name: 'Dash',
      type: 'public',
      description: 'Team dashboards.',
      homepage: 'https://dash.globex.example',
      redirectUris: ['https://dash.globex.example/callback'],
      scopes: [{ scope: 'openid', reason: 'Sign the user in' }],
    }),
    seedApp({
      id: 'app_initech_tickets',
      ownerHandle: 'initech',
      name: 'Tickets',
      type: 'confidential',
      redirectUris: ['https://tickets.initech.example/callback'],
    }),
  ]
}

function seedDomains(): Map<string, OwnerDomain[]> {
  const domains = new Map<string, OwnerDomain[]>()
  domains.set('acme', [
    { domain: 'acme.example', method: 'dns', token: 'neoworks-verify=acme0123456789', verified: true, verifiedAt: daysFromNow(-100), lastCheckedAt: daysFromNow(-1) },
    { domain: 'docs.acme.example', method: 'wellKnown', token: 'neoworks-verify=docs9876543210', verified: false, verifiedAt: null, lastCheckedAt: null },
  ])
  return domains
}

function seedSchema(scope: string, name: string, title: string, official: boolean): RegistrySchema {
  return {
    scope,
    name,
    title,
    description: `${title} collection`,
    tags: [],
    license: 'MIT',
    repository: '',
    latestVersion: '1.0.0',
    official,
    downloadsTotal: 0,
    createdAt: daysFromNow(-80),
    updatedAt: daysFromNow(-8),
  }
}

function seedSchemas(): RegistrySchema[] {
  const recipes = { ...seedSchema('acme', 'recipes', 'Recipes', false), latestVersion: '1.1.0' }
  return [
    seedSchema('moritz', 'notes', 'Notes', false),
    recipes,
    seedSchema('globex', 'ledger', 'Ledger', false),
    seedSchema('neoworks', 'commerce', 'Commerce', true),
  ]
}

function actorOwner(handle: string, displayName: string): Owner {
  return { handle, kind: 'user', displayName, verified: false }
}

function seedPublishes(): Map<string, PublishAttempt[]> {
  const moritz = actorOwner('moritz', 'Moritz Utcke')
  const alice = actorOwner('alice', 'Alice Example')
  const publishes = new Map<string, PublishAttempt[]>()
  publishes.set('moritz/notes', [{ version: '1.0.0', at: daysFromNow(-30), actor: moritz, accepted: true, violations: [] }])
  publishes.set('acme/recipes', [
    {
      version: '2.0.0',
      at: daysFromNow(-3),
      actor: alice,
      accepted: false,
      violations: [
        { rule: 'no-removed-field', path: 'Recipe.servings', message: 'Field 2 "servings" was removed; stored data would become unreadable.' },
        { rule: 'no-type-change', path: 'Recipe.title', message: 'Field 1 "title" changed from string to bytes.' },
      ],
    },
    { version: '1.1.0', at: daysFromNow(-8), actor: moritz, accepted: true, violations: [] },
    { version: '1.0.0', at: daysFromNow(-70), actor: moritz, accepted: true, violations: [] },
  ])
  publishes.set('globex/ledger', [{ version: '1.0.0', at: daysFromNow(-50), actor: actorOwner('carol', 'Carol Ledger'), accepted: true, violations: [] }])
  publishes.set('neoworks/commerce', [{ version: '1.0.0', at: daysFromNow(-80), actor: actorOwner('dana', 'Dana Initech'), accepted: true, violations: [] }])
  return publishes
}

const GIGABYTE = 1024 * 1024 * 1024

function seedConnections(): StubConnection[] {
  return [
    {
      clientId: 'neoworks-calendar', name: 'Neoworks Calendar', description: 'Your calendar.', ownerHandle: 'neoworks', verified: true,
      firstParty: true, reviewStatus: 'none', reviewReason: null, logoUrl: null, scopes: ['openid', '@neoworks/calendar:write'],
      authorizedAt: daysFromNow(-90), installs: [{ id: 'install-cal', name: 'Laptop', createdAt: daysFromNow(-90), revokedAt: null }],
      usedBytes: 40 * 1024 * 1024, capBytes: null,
    },
    {
      clientId: 'app_acme_recipes', name: 'Recipes', description: 'Recipe collections for families.', ownerHandle: 'acme', verified: true,
      firstParty: false, reviewStatus: 'approved', reviewReason: null, logoUrl: null, scopes: ['openid', '@acme/recipes:read'],
      authorizedAt: daysFromNow(-30), installs: [{ id: 'install-recipes', name: 'Phone', createdAt: daysFromNow(-30), revokedAt: null }],
      usedBytes: 300 * 1024 * 1024, capBytes: GIGABYTE,
    },
    {
      clientId: 'app_acme_planner', name: 'Planner', description: 'Weekly meal planner.', ownerHandle: 'acme', verified: false,
      firstParty: false, reviewStatus: 'suspended', reviewReason: 'Reports of unwanted data collection.', logoUrl: null, scopes: ['profile'],
      authorizedAt: daysFromNow(-10), installs: [{ id: 'install-planner', name: 'Tablet', createdAt: daysFromNow(-10), revokedAt: null }],
      usedBytes: 2 * 1024 * 1024, capBytes: null,
    },
  ]
}

export function seedWorld(): World {
  const world: World = {
    users: seedUsers(),
    administratorIds: ['user-reviewer'],
    connections: seedConnections(),
    storageQuotaBytes: 5 * GIGABYTE,
    organizations: seedOrganizations(),
    apps: seedApps(),
    domains: seedDomains(),
    schemas: seedSchemas(),
    publishes: seedPublishes(),
    nextId: 1,
  }
  return world
}

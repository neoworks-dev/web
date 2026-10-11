import type { DeveloperApp, OwnerDomain } from '@neoworks-dev/platform'
import { redirectUrisOffVerifiedDomains } from './appFields'

export interface RejectedPublish {
	scope: string
	name: string
	version: string
}

export interface TodoInput {
	ownerHandle: string
	receivedInvitationCount: number
	sentInvitationCount: number
	apps: DeveloperApp[]
	domains: OwnerDomain[]
	rejectedPublishes: RejectedPublish[]
}

export interface Todo {
	id: string
	text: string
	href: string
}

function invitationTodos(input: TodoInput): Todo[] {
	const todos: Todo[] = []
	if (input.receivedInvitationCount > 0) {
		todos.push({
			id: 'received-invitations',
			text: `${input.receivedInvitationCount} invitation(s) waiting for you`,
			href: '/dashboard/developer/invitations',
		})
	}
	if (input.sentInvitationCount > 0) {
		todos.push({
			id: 'sent-invitations',
			text: `${input.sentInvitationCount} invitation(s) not yet accepted`,
			href: `/dashboard/developer/${input.ownerHandle}/members`,
		})
	}
	return todos
}

function domainTodos(input: TodoInput): Todo[] {
	const affected = input.apps.filter((app) => redirectUrisOffVerifiedDomains(app.redirectUris, input.domains).length > 0)
	return affected.map((app) => ({
		id: `redirect-${app.id}`,
		text: `${app.name} has redirect URIs outside your verified domains`,
		href: `/dashboard/developer/${input.ownerHandle}/apps/${app.id}`,
	}))
}

function publishTodos(input: TodoInput): Todo[] {
	return input.rejectedPublishes.map((publish) => ({
		id: `rejected-${publish.scope}-${publish.name}-${publish.version}`,
		text: `@${publish.scope}/${publish.name} ${publish.version} was rejected`,
		href: `/dashboard/developer/${input.ownerHandle}/schemas`,
	}))
}

export function buildTodos(input: TodoInput): Todo[] {
	return [...invitationTodos(input), ...domainTodos(input), ...publishTodos(input)]
}

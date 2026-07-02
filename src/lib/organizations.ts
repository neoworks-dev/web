import type { CreateOrganizationArgs } from '@neoworks-dev/sdk';
import { slugify } from './slug';

export interface InviteDraft {
	email: string;
	role: string;
}

export interface OrgWizardState {
	name: string;
	slug: string;
	description: string;
	billingEmail: string;
	invites: InviteDraft[];
}

export function emptyWizardState(): OrgWizardState {
	return { name: '', slug: '', description: '', billingEmail: '', invites: [] };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
	return EMAIL_PATTERN.test(email.trim());
}

/** Maps wizard state to the SDK create payload. Name, slug, description and
 *  billing email are all required and validated before this is called. */
export function buildCreateArgs(state: OrgWizardState): CreateOrganizationArgs {
	const slug = state.slug.trim() || slugify(state.name);
	return {
		name: state.name.trim(),
		slug,
		description: state.description.trim(),
		billingEmail: state.billingEmail.trim(),
	};
}

/** Keeps only invite rows with a non-empty email, trimming addresses. */
export function validInvites(invites: InviteDraft[]): InviteDraft[] {
	return invites
		.map((invite) => ({ email: invite.email.trim(), role: invite.role }))
		.filter((invite) => invite.email.length > 0);
}

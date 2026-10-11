import type { ReviewStatus } from '@neoworks-dev/sdk'

export type StatusTone = 'green' | 'red' | 'amber' | 'blue' | 'violet' | 'neutral'

const REVIEW_TONES: Record<ReviewStatus, StatusTone> = {
	none: 'neutral',
	pending: 'amber',
	approved: 'green',
	rejected: 'red',
	suspended: 'red',
}

const REVIEW_LABELS: Record<ReviewStatus, string> = {
	none: 'Not submitted',
	pending: 'In review',
	approved: 'Approved',
	rejected: 'Rejected',
	suspended: 'Suspended',
}

export function reviewTone(status: ReviewStatus): StatusTone {
	return REVIEW_TONES[status]
}

export function reviewLabel(status: ReviewStatus): string {
	return REVIEW_LABELS[status]
}

/** Only an app that was never submitted, or was rejected, can be submitted for review. */
export function canSubmitForReview(status: ReviewStatus): boolean {
	return status === 'none' || status === 'rejected'
}

const REVIEW_NOTES: Record<ReviewStatus, string> = {
	none: '',
	pending: 'Neoworks is reviewing this app. You will see the decision here.',
	approved: 'Approved. Asking for more scopes than were approved, or a logo that resembles another app, sends the app back to review.',
	rejected: '',
	suspended: 'Neoworks suspended this app: it gets no new authorizations and no token refreshes. See the reason above.',
}

/** What to tell the developer when the app cannot be submitted right now. */
export function reviewNote(status: ReviewStatus): string {
	return REVIEW_NOTES[status]
}

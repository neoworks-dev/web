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

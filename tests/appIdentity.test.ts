import { describe, expect, test } from 'bun:test'
import { colourFor, initialsOf } from '../src/lib/developer/appIdentity'
import { canSubmitForReview, reviewNote } from '../src/lib/developer/status'

describe('the badge of an app without a logo', () => {
	test('shows the first letters of the first two words', () => {
		expect(initialsOf('Recipe Box')).toBe('RB')
		expect(initialsOf('planner')).toBe('P')
		expect(initialsOf('---')).toBe('?')
	})

	test('derives a stable colour from the client id', () => {
		expect(colourFor('app_acme_recipes')).toBe(colourFor('app_acme_recipes'))
		expect(colourFor('app_acme_recipes')).not.toBe(colourFor('app_acme_planner'))
		expect(colourFor('x')).toMatch(/^hsl\(\d+ 55% 38%\)$/)
	})
})

describe('submitting for review', () => {
	test('is possible only before a submission or after a rejection', () => {
		expect(canSubmitForReview('none')).toBe(true)
		expect(canSubmitForReview('rejected')).toBe(true)
		expect(canSubmitForReview('pending')).toBe(false)
		expect(canSubmitForReview('approved')).toBe(false)
		expect(canSubmitForReview('suspended')).toBe(false)
	})

	test('says why an app cannot be submitted', () => {
		expect(reviewNote('pending')).toContain('reviewing')
		expect(reviewNote('suspended')).toContain('suspended')
	})
})

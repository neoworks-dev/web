import type { SubmitFunction } from '@sveltejs/kit'

/** Submit enhanced, but keep what the user typed (edit forms show saved values). */
export const keepFormValues: SubmitFunction = () => {
	return async ({ update }) => {
		await update({ reset: false })
	}
}

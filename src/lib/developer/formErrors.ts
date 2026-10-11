export interface FormFailureData {
	formName?: string
	message?: string
	field?: string
	code?: string
}

/** The message for one input, when the failed form is `formName` and the server named that field. */
export function fieldError(form: FormFailureData | null | undefined, formName: string, field: string): string {
	if (form === null || form === undefined || form.formName !== formName || form.field !== field) {
		return ''
	}
	if (form.message === undefined) {
		return ''
	}
	return form.message
}

/** The message to show once for a form: failures without a field, or for a field with no input of its own. */
export function generalError(form: FormFailureData | null | undefined, formName: string, handledFields: string[] = []): string {
	if (form === null || form === undefined || form.formName !== formName || form.message === undefined) {
		return ''
	}
	if (form.field !== undefined && handledFields.includes(form.field)) {
		return ''
	}
	return form.message
}

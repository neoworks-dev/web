import type { AppFields, RequestedScope } from '@neoworks-dev/sdk'
import { parseLineList } from '$lib/developer/appFields'
import { formText } from './developerSdk'

function requestedScopes(form: FormData): RequestedScope[] {
	return form.getAll('scope').map((entry) => {
		const scope = String(entry)
		return { scope, reason: formText(form, `reason:${scope}`) }
	})
}

/** The app fields a create or settings form posts: text fields, one redirect URI per line, scope checkboxes with reasons. */
export function appFieldsFromForm(form: FormData): AppFields {
	return {
		name: formText(form, 'name'),
		description: formText(form, 'description'),
		homepage: formText(form, 'homepage'),
		redirectUris: parseLineList(String(form.get('redirectUris') || '')),
		scopes: requestedScopes(form),
	}
}

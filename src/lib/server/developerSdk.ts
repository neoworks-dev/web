import { error, fail, type Cookies } from '@sveltejs/kit'
import { createPlatform, type Platform } from '@neoworks-dev/platform'
import { ApiError, type TokenSet, type TokenStorage } from '@neoworks-dev/sdk'
import { urls } from '$lib/urls'

const ACCESS_TOKEN_COOKIE = 'nw_access_token'

/** Exposes the request's access token cookie; the server hook already refreshes it. */
class AccessTokenCookieStorage implements TokenStorage {
	constructor(private readonly cookies: Cookies) {}

	load(): TokenSet | null {
		const accessToken = this.cookies.get(ACCESS_TOKEN_COOKIE)
		if (accessToken === undefined || accessToken === '') {
			return null
		}
		return { accessToken, refreshToken: '', expiresAt: Number.MAX_SAFE_INTEGER, scope: '' }
	}

	save(): void {}

	clear(): void {}
}

/** The SDK for one request, authenticated with the `nw_access_token` cookie. */
export function createDeveloperSdk(cookies: Cookies): Platform {
	return createPlatform({
		clientId: 'neoworks.dev',
		redirectUri: `${urls.web}/auth/callback`,
		url: urls.oauth,
		apiUrl: urls.api,
		storage: new AccessTokenCookieStorage(cookies),
	})
}

/** Awaits an API call for a load function: API failures become SvelteKit errors. */
export async function orFail<Result>(call: Promise<Result>): Promise<Result> {
	try {
		return await call
	} catch (caught) {
		if (caught instanceof ApiError) {
			return error(caught.status, caught.message)
		}
		throw caught
	}
}

export interface FormFailure {
	formName: string
	code: string
	message: string
	field?: string
	permission?: string
}

/** Runs a form action's API call; an API failure becomes a `fail()` the page shows under `formName`. */
export async function attempt<Result>(formName: string, call: () => Promise<Result>) {
	try {
		return { result: await call(), failure: null }
	} catch (caught) {
		if (!(caught instanceof ApiError)) {
			throw caught
		}
		const failure: FormFailure = { formName, code: caught.code, message: caught.message, field: caught.field, permission: caught.permission }
		return { result: null, failure: fail(caught.status, failure) }
	}
}

export function formText(form: FormData, name: string): string {
	const value = form.get(name)
	if (typeof value !== 'string') {
		return ''
	}
	return value.trim()
}

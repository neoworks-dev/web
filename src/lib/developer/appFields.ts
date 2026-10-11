import type { OwnerDomain } from '@neoworks-dev/sdk'

/** One value per non-empty line. */
export function parseLineList(text: string): string[] {
	return text
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line !== '')
}

function hostOf(uri: string): string | null {
	if (!uri.startsWith('https://')) {
		return null
	}
	try {
		return new URL(uri).hostname
	} catch {
		return null
	}
}

function hostIsVerified(host: string, domains: OwnerDomain[]): boolean {
	return domains.some((entry) => entry.verified && (host === entry.domain || host.endsWith(`.${entry.domain}`)))
}

/** https redirect URIs whose host is not on one of the owner's verified domains. */
export function redirectUrisOffVerifiedDomains(redirectUris: string[], domains: OwnerDomain[]): string[] {
	return redirectUris.filter((uri) => {
		const host = hostOf(uri)
		return host !== null && !hostIsVerified(host, domains)
	})
}

const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB']

export function formatBytes(bytes: number): string {
	let value = bytes
	let unitIndex = 0
	while (value >= 1024 && unitIndex < SIZE_UNITS.length - 1) {
		value /= 1024
		unitIndex += 1
	}
	if (unitIndex === 0) {
		return `${value} B`
	}
	return `${value.toFixed(1)} ${SIZE_UNITS[unitIndex]}`
}

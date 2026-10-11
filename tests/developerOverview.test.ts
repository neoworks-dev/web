import { describe, expect, it } from 'bun:test';
import { type Platform } from '@neoworks-dev/platform';
import { ApiError } from '@neoworks-dev/sdk';
import { loadOwnerOverview } from '../src/lib/server/overview';

function sdkWithDomains(listDomains: () => Promise<unknown[]>): Platform {
	return {
		apps: { listForOwner: async () => [], get: async () => ({}) },
		schemas: { list: async () => [] },
		domains: { list: listDomains },
	} as unknown as Platform;
}

describe('loadOwnerOverview', () => {
	it('shows no domains while the API does not serve the domain routes', async () => {
		const sdk = sdkWithDomains(async () => {
			throw new ApiError(404, 'not_found', 'Not Found');
		});
		expect(await loadOwnerOverview(sdk, 'letsmoe')).toEqual({ apps: [], schemas: [], domains: [] });
	});

	it('still fails on other API errors', async () => {
		const sdk = sdkWithDomains(async () => {
			throw new ApiError(500, 'server_error', 'boom');
		});
		await expect(loadOwnerOverview(sdk, 'letsmoe')).rejects.toBeInstanceOf(ApiError);
	});
});

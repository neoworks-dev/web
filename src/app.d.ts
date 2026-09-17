// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { PageMeta } from '$lib/meta';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
      access_token?: string
    }
		interface PageData {
			meta?: PageMeta
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};

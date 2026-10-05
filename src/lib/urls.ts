import { neoworksUrls } from "@neoworks-dev/sdk"

// One base domain drives every service + sibling-app URL (dev: neoworks.localhost,
// prod: neoworks.dev). Server code reads the runtime process env; client bundles
// fall back to the Vite-injected build env, then the dev default.
const BASE_DOMAIN =
  (typeof process !== "undefined" && process.env?.BASE_DOMAIN) ||
  import.meta.env.VITE_BASE_DOMAIN ||
  "neoworks.localhost"

const BASE_SCHEME =
  (typeof process !== "undefined" && process.env?.BASE_SCHEME) ||
  import.meta.env.VITE_BASE_SCHEME ||
  "https"

const BASE_PORT =
  (typeof process !== "undefined" && process.env?.BASE_PORT) ||
  import.meta.env.VITE_BASE_PORT ||
  ""

export const urls = neoworksUrls({ baseDomain: BASE_DOMAIN, scheme: BASE_SCHEME, port: BASE_PORT })

/** The main site at the base domain, for links out of a product subdomain. */
export const siteUrl = urls.web

/** URL of a sibling app served at `<subdomain>.<base>` (e.g. muse, calendar). */
export function appUrl(subdomain: string): string {
  return urls.app(subdomain)
}

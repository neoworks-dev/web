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

const derivedUrls = neoworksUrls({ baseDomain: BASE_DOMAIN, scheme: BASE_SCHEME, port: BASE_PORT })

// Point the dashboard at another API or OAuth server (for example the developer
// API stub) without changing the base domain. Unset or empty keeps the derived URL.
const API_URL_OVERRIDE = (typeof process !== "undefined" && process.env?.API_URL) || ""
const OAUTH_URL_OVERRIDE = (typeof process !== "undefined" && process.env?.OAUTH_URL) || ""

function overrideOrDerived(override: string, derived: string): string {
  if (override === "") {
    return derived
  }
  return override
}

export const urls = {
  ...derivedUrls,
  api: overrideOrDerived(API_URL_OVERRIDE, derivedUrls.api),
  oauth: overrideOrDerived(OAUTH_URL_OVERRIDE, derivedUrls.oauth),
}

/** The main site at the base domain, for links out of a product subdomain. */
export const siteUrl = urls.web

/** URL of a sibling app served at `<subdomain>.<base>` (e.g. muse, calendar). */
export function appUrl(subdomain: string): string {
  return urls.app(subdomain)
}

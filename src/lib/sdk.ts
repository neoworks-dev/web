import createSdk, { CookieTokenStorage, neoworksUrls } from "@neoworks-dev/sdk"

// All service URLs derive from one base domain (dev: neoworks.localhost,
// prod: neoworks.dev). Per-service VITE_*_URL overrides still win when set.
const urls = neoworksUrls({
  baseDomain: import.meta.env.VITE_BASE_DOMAIN,
  scheme: import.meta.env.VITE_BASE_SCHEME,
  port: import.meta.env.VITE_BASE_PORT,
})

export const sdk = createSdk({
  clientId: "neoworks.dev",
  redirectUri: `${urls.web}/auth/callback`,
  url: urls.oauth,
  apiUrl: urls.api,
  assetsUrl: urls.assets,
  scopes: ["openid", "email", "profile"],
  storage: new CookieTokenStorage(),
  // The refresh token is an HttpOnly cookie this code can't read; the server
  // endpoint rotates it and returns a fresh access token.
  refreshHandler: async () => {
    const res = await fetch("/auth/refresh", { method: "POST" })
    if (!res.ok) return null
    const data = (await res.json()) as { access_token?: string }
    if (!data.access_token) return null
    return data.access_token
  },
})

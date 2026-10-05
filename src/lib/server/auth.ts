import type { Cookies } from "@sveltejs/kit";
import { NeoworksAuth, neoworksUrls } from "@neoworks-dev/sdk";
import { CookiesTokenStorage } from "$lib/server/tokenStorage";

// Service URLs derive from one base domain (dev: neoworks.localhost,
// prod: neoworks.dev). Read at runtime from the server process env.
const urls = neoworksUrls({
  baseDomain: process.env.BASE_DOMAIN,
  scheme: process.env.BASE_SCHEME,
});

const AUTH_CONFIG = {
  clientId: "neoworks.dev",
  authServerUrl: urls.oauth,
  redirectUri: `${urls.web}/auth/callback`,
  scopes: ["openid", "email", "profile"] as string[],
};

export const PKCE_VERIFIER_COOKIE = "nw_pkce_verifier";
export const PKCE_STATE_COOKIE = "nw_pkce_state";

// PKCE cookies must survive the top-level redirect back from the auth server,
// so sameSite must be "lax" (strict drops them on cross-site navigation).
const PKCE_COOKIE_OPTS = {
  path: "/",
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  maxAge: 600,
} as const;

/** Server-side NeoworksAuth backed by HttpOnly SvelteKit cookies. */
export function createServerAuth(cookies: Cookies): NeoworksAuth {
  return new NeoworksAuth({
    ...AUTH_CONFIG,
    storage: new CookiesTokenStorage(cookies),
  });
}

/**
 * Begin the PKCE login flow: stash the verifier + state in HttpOnly cookies and
 * return the authorization URL to redirect the browser to.
 */
export async function startLogin(cookies: Cookies): Promise<string> {
  const auth = createServerAuth(cookies);
  const { url, verifier, state } = await auth.getAuthorizationUrl();
  cookies.set(PKCE_VERIFIER_COOKIE, verifier, PKCE_COOKIE_OPTS);
  cookies.set(PKCE_STATE_COOKIE, state, PKCE_COOKIE_OPTS);
  return url;
}

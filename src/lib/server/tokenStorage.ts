import type { Cookies } from "@sveltejs/kit";
import type { TokenSet, TokenStorage } from "@neoworks-dev/sdk";

const ACCESS_TOKEN_KEY = "nw_access_token";
const REFRESH_TOKEN_KEY = "nw_refresh_token";
const EXPIRES_AT_KEY = "nw_expires_at";
const SCOPE_KEY = "nw_scope";

// The access token is readable by browser JS (the SPA calls the API directly
// with a Bearer header). The refresh token stays HttpOnly — server-only — so it
// can never be exfiltrated via XSS; refresh happens through /auth/refresh.
const READABLE_COOKIE_OPTS = {
  path: "/",
  httpOnly: false,
  secure: true,
  sameSite: "strict",
} as const;
const REFRESH_COOKIE_OPTS = {
  path: "/",
  httpOnly: true,
  secure: true,
  sameSite: "strict",
} as const;

/** Server-side TokenStorage backed by SvelteKit cookies, using the same cookie
 * names as the SDK's browser-side CookieTokenStorage. */
export class CookiesTokenStorage implements TokenStorage {
  constructor(private cookies: Cookies) {}

  load(): TokenSet | null {
    const accessToken = this.cookies.get(ACCESS_TOKEN_KEY);
    const refreshToken = this.cookies.get(REFRESH_TOKEN_KEY);
    if (!accessToken || !refreshToken) return null;

    return {
      accessToken,
      refreshToken,
      expiresAt: parseInt(this.cookies.get(EXPIRES_AT_KEY) ?? "0", 10),
      scope: this.cookies.get(SCOPE_KEY) ?? "",
    };
  }

  save(tokens: TokenSet): void {
    this.cookies.set(ACCESS_TOKEN_KEY, tokens.accessToken, READABLE_COOKIE_OPTS);
    this.cookies.set(REFRESH_TOKEN_KEY, tokens.refreshToken, REFRESH_COOKIE_OPTS);
    this.cookies.set(EXPIRES_AT_KEY, String(tokens.expiresAt), READABLE_COOKIE_OPTS);
    this.cookies.set(SCOPE_KEY, tokens.scope, READABLE_COOKIE_OPTS);
  }

  clear(): void {
    this.cookies.delete(ACCESS_TOKEN_KEY, { path: "/" });
    this.cookies.delete(REFRESH_TOKEN_KEY, { path: "/" });
    this.cookies.delete(EXPIRES_AT_KEY, { path: "/" });
    this.cookies.delete(SCOPE_KEY, { path: "/" });
  }
}

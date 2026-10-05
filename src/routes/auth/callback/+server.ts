import { error, redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import {
  createServerAuth,
  PKCE_VERIFIER_COOKIE,
  PKCE_STATE_COOKIE,
} from "$lib/server/auth";

// The auth server redirects the browser here with ?code&state. We exchange the
// code server-side so the refresh token is written straight into an HttpOnly
// cookie and never passes through browser JS.
export const GET: RequestHandler = async ({ url, cookies }) => {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const authError = url.searchParams.get("error");

  const verifier = cookies.get(PKCE_VERIFIER_COOKIE);
  const storedState = cookies.get(PKCE_STATE_COOKIE);
  cookies.delete(PKCE_VERIFIER_COOKIE, { path: "/" });
  cookies.delete(PKCE_STATE_COOKIE, { path: "/" });

  // Redirecting back to /auth/login on failure would loop when the auth server
  // keeps refusing the request, so failures end here.
  if (authError) {
    throw error(400, describeAuthError(authError, url.searchParams.get("error_description")));
  }
  if (!code || !verifier || !state || state !== storedState) {
    throw error(400, "The sign-in attempt expired or did not match. Start it again.");
  }

  const auth = createServerAuth(cookies);
  await auth.exchangeCode(code, verifier);

  throw redirect(302, "/dashboard");
};

function describeAuthError(authError: string, description: string | null): string {
  if (description) {
    return description;
  }
  return authError;
}

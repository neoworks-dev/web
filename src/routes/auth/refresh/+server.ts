import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { NeoworksAuthError } from "@neoworks-dev/sdk";
import { createServerAuth } from "$lib/server/auth";

// Rotates the HttpOnly refresh cookie server-side and returns the new access
// token. The browser SDK calls this when its access token nears expiry, since
// it cannot read the refresh token itself.
export const POST: RequestHandler = async ({ cookies }) => {
  const auth = createServerAuth(cookies);

  try {
    const accessToken = await auth.forceRefresh();
    if (!accessToken) {
      return json({ error: "not_authenticated" }, { status: 401 });
    }
    return json({ access_token: accessToken });
  } catch (e) {
    if (e instanceof NeoworksAuthError) {
      return json({ error: e.code }, { status: 401 });
    }
    throw e;
  }
};

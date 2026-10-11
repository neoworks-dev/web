import type { Handle } from "@sveltejs/kit";
import { AuthError } from "@neoworks-dev/sdk";
import { createServerAuth } from "$lib/server/auth";

export const handle: Handle = async ({ event, resolve }) => {
  const auth = createServerAuth(event.cookies);

  try {
    event.locals.access_token = (await auth.getAccessToken()) ?? undefined;
  } catch (e) {
    if (!(e instanceof AuthError)) throw e;
  }

  return resolve(event);
};

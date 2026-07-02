import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { startLogin } from "$lib/server/auth";

export const load: PageServerLoad = async ({ cookies }) => {
  const url = await startLogin(cookies);
  throw redirect(302, url);
};

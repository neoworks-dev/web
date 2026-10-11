import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { startSignin } from "$lib/server/auth";

export const load: PageServerLoad = async ({ cookies }) => {
  const url = await startSignin(cookies);
  throw redirect(302, url);
};

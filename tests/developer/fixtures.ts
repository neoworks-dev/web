import { test as base, expect } from "@playwright/test";
import { NEWCOMER_TOKEN, SIGNED_IN_TOKEN } from "../support/developerApiStubWorld";

export interface DeveloperStubOptions {
  /** Base URL of the developer API stub, set in playwright.stub.config.ts. */
  stubUrl: string;
}

interface DeveloperFixtures {
  signInAs: (accessToken: string) => Promise<void>;
  signInAsMoritz: () => Promise<void>;
  signInAsNewcomer: () => Promise<void>;
}

/** Every test starts from the stub's seeded data and signs in by setting the access token cookie. */
export const test = base.extend<DeveloperStubOptions & DeveloperFixtures>({
  stubUrl: ["", { option: true }],

  page: async ({ page, request, stubUrl }, use) => {
    await request.post(`${stubUrl}/__reset`);
    await use(page);
  },

  signInAs: async ({ context, baseURL }, use) => {
    await use(async (accessToken) => {
      await context.addCookies([{ name: "nw_access_token", value: accessToken, url: String(baseURL) }]);
    });
  },

  signInAsMoritz: async ({ signInAs }, use) => {
    await use(() => signInAs(SIGNED_IN_TOKEN));
  },

  signInAsNewcomer: async ({ signInAs }, use) => {
    await use(() => signInAs(NEWCOMER_TOKEN));
  },
});

export { expect };

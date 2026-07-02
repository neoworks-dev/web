import { defineConfig, devices } from "@playwright/test";

/**
 * These end-to-end tests drive the real stack through the browser:
 * web (neoworks.localhost) → oauth (oauth.neoworks.localhost) → api → SurrealDB.
 *
 * The stack is NOT started by Playwright. Bring it up first with:
 *   process-compose up
 *
 * Caddy serves everything over HTTPS with a local CA, so the browser is told
 * to ignore certificate errors rather than trusting the CA per-machine.
 */
export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.e2e.ts",
  // Auth + provisioning hit several services in sequence; give them room.
  timeout: 60_000,
  expect: { timeout: 15_000 },
  // The happy-path specs create and reuse accounts/orgs, so keep runs serial.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "https://neoworks.localhost",
    ignoreHTTPSErrors: true,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});

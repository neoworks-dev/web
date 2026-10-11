import { defineConfig, devices } from "@playwright/test";
import type { DeveloperStubOptions } from "./tests/developer/fixtures";

/**
 * End-to-end tests of the developer dashboard against the in-memory developer
 * API stub (tests/support/developerApiStub.ts). The existing playwright.config.ts
 * drives the real stack instead.
 *
 * Playwright starts both servers: the stub, and the SvelteKit dev server pointed
 * at it through API_URL and OAUTH_URL.
 */
const stubPort = 4310;
const webPort = 4311;
const stubUrl = `http://127.0.0.1:${stubPort}`;

export default defineConfig<DeveloperStubOptions>({
  testDir: "./tests/developer",
  testMatch: "**/*.e2e.ts",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  webServer: [
    {
      command: "bun tests/support/developerApiStub.ts",
      port: stubPort,
      env: { DEVELOPER_API_STUB_PORT: String(stubPort) },
      reuseExistingServer: false,
    },
    {
      command: `bunx vite dev --host 127.0.0.1 --port ${webPort} --strictPort`,
      port: webPort,
      env: { API_URL: stubUrl, OAUTH_URL: stubUrl },
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
  use: {
    baseURL: `http://127.0.0.1:${webPort}`,
    stubUrl,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});

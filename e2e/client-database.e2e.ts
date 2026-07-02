import { test, expect } from "@playwright/test";
import { makeCredentials, signUp } from "./helpers";

/**
 * Full happy path: a fresh account creates an organization, an OAuth client
 * under it, and a database under that client. Each step is a prerequisite for
 * the next, so it runs as one continuous flow against the live stack.
 */
test("create an organization, a client, then a database", async ({ page }) => {
  const credentials = makeCredentials();
  const suffix = `${Date.now()}`;
  const orgName = `E2E Org ${suffix}`;
  const clientId = `e2e-client-${suffix}`;
  // The API restricts database names to letters, digits, and underscores.
  const databaseName = `e2e_db_${suffix}`;

  await signUp(page, credentials);

  // ── Organization ──────────────────────────────────────────────────────────
  await page.goto("/dashboard/organizations");
  await page.getByRole("button", { name: "New organization" }).click();

  // Name → Slug (auto-derived) → Description + billing → Logo → Invite → Review.
  await page.locator("#org-name").fill(orgName);
  await page.getByRole("button", { name: "Continue" }).click(); // Name → Slug
  await page.getByRole("button", { name: "Continue" }).click(); // Slug → Description
  await page.locator("#org-desc").fill("Created by the Playwright e2e suite.");
  await page.locator("#org-billing").fill(`billing-${suffix}@test.example.com`);
  await page.getByRole("button", { name: "Continue" }).click(); // Description → Logo
  await page.getByRole("button", { name: "Continue" }).click(); // Logo → Invite
  await page.getByRole("button", { name: "Continue" }).click(); // Invite → Review
  await page.getByRole("button", { name: "Create organization" }).click();

  // The wizard navigates to the new org's clients page on success.
  await page.waitForURL("**/dashboard/organizations/*/clients");
  const orgId = page.url().match(/organizations\/([^/]+)\/clients/)?.[1];
  expect(orgId).toBeTruthy();

  // ── Client ──────────────────────────────────────────────────────────────────
  await page.getByRole("button", { name: "New client" }).click();
  await page.locator("#c-id").fill(clientId);
  await page.locator("#c-scopes").fill("openid email profile");
  await page.locator("#c-uris").fill("https://example.com/callback");
  await page.getByRole("button", { name: "Create client" }).click();

  // The generated secret is shown once in a follow-up dialog.
  await expect(page.getByText("Client created")).toBeVisible();
  await page.getByRole("button", { name: "Done" }).click();
  await expect(page.getByText(clientId, { exact: true })).toBeVisible();

  // ── Database ──────────────────────────────────────────────────────────────
  await page.goto(`/dashboard/organizations/${orgId}/clients/${clientId}/databases`);
  await page.getByRole("button", { name: "New Database" }).click();

  await page.getByPlaceholder("database-name").fill(databaseName);

  // Add a table so the database is provisioned with a real schema.
  await page.getByRole("button", { name: "Table", exact: true }).click();
  await expect(page.getByText("TABLES (1)")).toBeVisible();

  await page.getByRole("button", { name: "Create Database" }).click();

  // Provisioning returns to the list with a one-time password banner and a row.
  await expect(page.getByText("Database created — save your password now")).toBeVisible();
  await expect(page.getByRole("cell", { name: databaseName, exact: true })).toBeVisible();
});

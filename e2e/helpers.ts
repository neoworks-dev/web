import { expect, type Page } from "@playwright/test";

export interface Credentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/** Build a unique account so reruns never collide on a taken email. */
export function makeCredentials(): Credentials {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  return {
    firstName: "E2E",
    lastName: "Tester",
    email: `e2e-${suffix}@test.example.com`,
    password: "e2e-password-12345",
  };
}

/**
 * Drive the OAuth signup UI end to end: the account step, the browser-side
 * key generation, the recovery confirmation, and the redirect back to the
 * dashboard. Leaves the page authenticated on /dashboard.
 */
export async function signUp(page: Page, credentials: Credentials): Promise<void> {
  // The web app has no signup route of its own — it starts the login flow,
  // which lands on the OAuth login page, then follows the "Sign up" link.
  await page.goto("/auth/login");
  await page.getByRole("link", { name: /sign up/i }).click();

  await page.locator("#first_name").fill(credentials.firstName);
  await page.locator("#last_name").fill(credentials.lastName);
  await page.locator("#email").fill(credentials.email);
  await page.locator("#password").fill(credentials.password);

  // Generating the Account Master Key runs Argon2id in the browser, so the
  // recovery step only appears once that finishes.
  await page.locator("#continue-btn").click();
  await expect(page.locator("#step-recovery")).toBeVisible();
  await expect(page.locator("#recovery-key-display")).not.toBeEmpty();

  await page.locator("#recovery-confirm").check();
  const submit = page.locator("#submit-btn");
  await expect(submit).toBeEnabled();
  await submit.click();

  await page.waitForURL("**/dashboard**");
}

/** Drive the OAuth login UI for an existing account back to the dashboard. */
export async function logIn(page: Page, credentials: Credentials): Promise<void> {
  await page.goto("/auth/login");
  await page.locator("#email").fill(credentials.email);
  await page.locator("#password").fill(credentials.password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL("**/dashboard**");
}

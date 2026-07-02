import { test, expect } from "@playwright/test";
import { makeCredentials, signUp, logIn, type Credentials } from "./helpers";

// Sign up once, then sign back in with the same account in a fresh context.
test.describe.serial("authentication", () => {
  let credentials: Credentials;

  test.beforeAll(() => {
    credentials = makeCredentials();
  });

  test("signup creates an account and lands on the dashboard", async ({ page }) => {
    await signUp(page, credentials);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("login with the new account lands on the dashboard", async ({ page }) => {
    await logIn(page, credentials);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("login with a wrong password shows an error", async ({ page }) => {
    await page.goto("/auth/login");
    await page.locator("#email").fill(credentials.email);
    await page.locator("#password").fill("definitely-not-the-password");
    await page.locator('button[type="submit"]').click();

    // The OAuth login page re-renders with a stable error, never the dashboard.
    await expect(page.locator(".error")).toContainText(/invalid email or password/i);
    await expect(page).not.toHaveURL(/\/dashboard/);
  });
});

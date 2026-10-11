import { expect, test } from "./fixtures";

test("registering a public app shows the client id and no secret", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/moritz/apps/new");

  await page.getByLabel("Name", { exact: true }).fill("Todo");
  await page.getByLabel("Redirect URIs").fill("http://localhost:3000/callback");
  await page.getByLabel("Scope openid").check();
  await page.getByLabel("Reason for openid").fill("Sign the user in");
  await page.getByRole("button", { name: "Register app" }).click();

  await expect(page.getByTestId("app-created")).toBeVisible();
  await expect(page.getByTestId("client-id")).toContainText("app_");
  await expect(page.getByText("This is a public app")).toBeVisible();
  await expect(page.getByTestId("client-secret")).toHaveCount(0);
});

test("registering a confidential app shows the secret exactly once", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/moritz/apps/new");

  await page.getByLabel("Confidential").check();
  await page.getByLabel("Name", { exact: true }).fill("Server");
  await page.getByLabel("Redirect URIs").fill("https://server.example/callback");
  await page.getByLabel("Scope @moritz/notes:read").check();
  await page.getByLabel("Reason for @moritz/notes:read").fill("Show notes");
  await page.getByRole("button", { name: "Register app" }).click();

  const secret = page.getByTestId("client-secret");
  await expect(secret).toContainText("nws_");
  await expect(secret).toContainText("Shown once");

  await page.getByRole("link", { name: "Open Server" }).click();
  await page.getByRole("link", { name: "Credentials" }).click();
  await expect(page.getByTestId("client-secret")).toHaveCount(0);
  await expect(page.getByTestId("client-id")).toContainText("app_");
});

test("a registered app appears in the list with its review status", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/acme/apps");
  await expect(page.locator("a", { hasText: "Recipes" })).toContainText("Approved");
  await expect(page.locator("a", { hasText: "Planner" })).toContainText("Rejected");
});

test("an invalid redirect URI is explained, and a valid one saves", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/acme/apps/app_acme_planner");

  await page.getByLabel("Redirect URIs").fill("http://example.com/callback");
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByRole("alert")).toContainText("http://example.com/callback is not allowed");

  await page.getByLabel("Redirect URIs").fill("https://planner.acme.example/callback\ncom.acme.planner://auth");
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByText("Settings saved.")).toBeVisible();

  await page.reload();
  await expect(page.getByLabel("Redirect URIs")).toHaveValue(/com\.acme\.planner:\/\/auth/);
});

test("rotating a secret shows the new one once", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/acme/apps/app_acme_recipes/credentials");

  await page.getByRole("button", { name: "Rotate secret" }).click();
  await expect(page.getByTestId("client-secret")).toContainText("nws_");

  await page.reload();
  await expect(page.getByTestId("client-secret")).toHaveCount(0);
});

test("a public app has no secret to rotate", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/acme/apps/app_acme_planner/credentials");
  await expect(page.getByText("has no client secret")).toBeVisible();
  await expect(page.getByRole("button", { name: "Rotate secret" })).toHaveCount(0);
});

test("actions without permission are disabled and name the permission", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/globex/apps/app_globex_dash");

  await expect(page.getByRole("button", { name: "Save settings" })).toBeDisabled();
  await expect(page.getByText("Requires apps.edit")).toBeVisible();

  await page.getByRole("link", { name: "Usage" }).click();
  await expect(page.getByText("Requires the usage.view permission")).toBeVisible();

  await page.getByRole("link", { name: "Review" }).click();
  await expect(page.getByRole("button", { name: "Submit for review" })).toBeDisabled();
  await expect(page.getByText("Requires apps.review")).toBeVisible();
});

test("per-app grants unlock exactly that app", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/globex/apps/app_globex_ledger");
  await expect(page.getByRole("button", { name: "Save settings" })).toBeEnabled();

  await page.getByRole("link", { name: "Usage" }).click();
  await expect(page.getByTestId("usage")).toContainText("Authorized users");
  await expect(page.getByTestId("usage")).toContainText("Rate-limited requests");
  await expect(page.getByTestId("usage")).toContainText("Storage");
});

test("creating an app needs apps.create", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/globex/apps");
  await expect(page.getByRole("button", { name: "New app" })).toBeDisabled();
  await expect(page.getByText("Requires apps.create")).toBeVisible();
});

test("submitting for review validates the privacy policy", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/acme/apps/app_acme_planner/review");
  await expect(page.getByText("The privacy policy does not mention data deletion.")).toBeVisible();

  await page.getByLabel("Privacy policy URL").fill("http://acme.example/privacy");
  await page.getByLabel("Support contact").fill("support@acme.example");
  await page.getByRole("button", { name: "Submit for review" }).click();
  await expect(page.getByRole("alert")).toContainText("must be an https:// URL");

  await page.getByLabel("Privacy policy URL").fill("https://acme.example/privacy");
  await page.getByRole("button", { name: "Submit for review" }).click();
  await expect(page.getByText("In review").first()).toBeVisible();
});

test("a logo can be uploaded and removed", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/acme/apps/app_acme_planner/logo");

  const pixel = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );
  await page.getByLabel("Logo file").setInputFiles({ name: "logo.png", mimeType: "image/png", buffer: pixel });
  await page.getByRole("button", { name: "Upload logo" }).click();
  await expect(page.getByRole("img", { name: "Planner logo" })).toBeVisible();

  await page.getByRole("button", { name: "Remove logo" }).click();
  await expect(page.getByText("No logo uploaded.")).toBeVisible();
});

test("deleting an app needs its name typed and removes it", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/acme/apps/app_acme_planner/danger");

  const deleteButton = page.getByRole("button", { name: "Delete app" });
  await expect(deleteButton).toBeDisabled();
  await page.getByLabel("Type Planner to confirm").fill("Planner");
  await deleteButton.click();

  await expect(page).toHaveURL(/\/dashboard\/developer\/acme\/apps$/);
  await expect(page.locator("a", { hasText: "Planner" })).toHaveCount(0);
});

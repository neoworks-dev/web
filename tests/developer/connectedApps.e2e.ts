import { expect, test } from "./fixtures";

test("connected apps show who is behind each app and whether it is verified", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/connected-apps");

  const official = page.getByTestId("app-neoworks-calendar");
  await expect(official).toContainText("Made by Neoworks");
  await expect(official.getByTestId("initials")).toHaveText("NC");

  const recipes = page.getByTestId("app-app_acme_recipes");
  await expect(recipes.getByTestId("owner")).toHaveText("by Acme Inc (@acme)");
  await expect(recipes).toContainText("Verified by Acme Inc");
  await expect(recipes).toContainText("Reviewed");

  const planner = page.getByTestId("app-app_acme_planner");
  await expect(planner).toContainText("Unverified");
});

test("a suspended app says so and why", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/connected-apps");

  const planner = page.getByTestId("app-app_acme_planner");
  await expect(planner.getByRole("alert")).toContainText("Neoworks suspended this app: Reports of unwanted data collection.");
  await expect(planner).toContainText("Suspended");
});

test("the user sees the quota and sets and removes a cap on one app", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/connected-apps");

  await expect(page.getByTestId("storage-total")).toContainText("of 5.0 GB used");
  const planner = page.getByTestId("app-app_acme_planner");
  await planner.getByLabel("Storage cap (MB, empty for none)").fill("50");
  await planner.getByRole("button", { name: "Set cap" }).click();
  await expect(planner.getByRole("status")).toHaveText("Storage cap saved.");
  await expect(planner.getByLabel("Storage cap (MB, empty for none)")).toHaveValue("50");

  await planner.getByLabel("Storage cap (MB, empty for none)").fill("many");
  await planner.getByRole("button", { name: "Set cap" }).click();
  await expect(planner.getByText("Enter a number of megabytes")).toBeVisible();

  await planner.getByLabel("Storage cap (MB, empty for none)").fill("");
  await planner.getByRole("button", { name: "Set cap" }).click();
  await expect(planner.getByRole("status")).toHaveText("Storage cap saved.");
  await expect(planner.getByLabel("Storage cap (MB, empty for none)")).toHaveValue("");
});

test("an install can be revoked", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/connected-apps");

  const recipes = page.getByTestId("app-app_acme_recipes");
  await recipes.getByRole("button", { name: "Revoke" }).click();
  await expect(recipes.getByRole("button", { name: "Revoke" })).toHaveCount(0);
});

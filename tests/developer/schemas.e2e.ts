import { expect, test } from "./fixtures";

test("a rejected publish shows the compatibility violations", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/acme/schemas");

  const history = page.getByTestId("publishes-recipes");
  const rejected = history.getByRole("listitem").filter({ hasText: "2.0.0" }).first();
  await expect(rejected).toContainText("Rejected");
  await expect(rejected).toContainText("no-removed-field");
  await expect(rejected).toContainText("Recipe.servings");
  await expect(rejected).toContainText('Field 2 "servings" was removed');

  const accepted = history.getByRole("listitem").filter({ hasText: "1.1.0" }).first();
  await expect(accepted).toContainText("Accepted");
});

test("the schemas page explains the CLI and links the OpenSchema site", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/acme/schemas");

  await expect(page.getByText("openschema login")).toBeVisible();
  await expect(page.getByText("You can publish")).toBeVisible();
  await expect(page.getByRole("link", { name: "Open the OpenSchema site" })).toBeVisible();
});

test("without schemas.publish the page names the permission", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/globex/schemas");
  await expect(page.getByText("Requires the schemas.publish permission")).toBeVisible();
});

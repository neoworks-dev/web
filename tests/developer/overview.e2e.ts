import { expect, test } from "./fixtures";

test("the overview counts apps, schemas and members and lists to-dos", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/acme");

  await expect(page.getByTestId("count-apps")).toHaveText("2");
  await expect(page.getByTestId("count-schemas")).toHaveText("1");
  await expect(page.getByTestId("count-members")).toHaveText("3");

  const todos = page.getByTestId("todos");
  await expect(todos).toContainText("1 invitation(s) waiting for you");
  await expect(todos).toContainText("Planner has redirect URIs outside your verified domains");
  await expect(todos).toContainText("@acme/recipes 2.0.0 was rejected");
});

test("the overview lists review and verification status per app", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/acme");

  const statuses = page.getByTestId("app-statuses").getByRole("listitem");
  await expect(statuses.filter({ hasText: "Recipes" })).toContainText("Approved");
  await expect(statuses.filter({ hasText: "Recipes" })).toContainText("Verified");
  await expect(statuses.filter({ hasText: "Planner" })).toContainText("Rejected");
  await expect(statuses.filter({ hasText: "Planner" })).toContainText("Unverified");
});

test("the personal overview has one member and its own apps", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/moritz");

  await expect(page.getByTestId("count-members")).toHaveText("1");
  await expect(page.getByTestId("count-apps")).toHaveText("1");
  await expect(page.getByTestId("count-schemas")).toHaveText("1");
});

test("the audit log lists organization activity and records new actions", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/acme/audit");
  await expect(page.getByTestId("audit-entries")).toContainText("organization.create");

  await page.goto("/dashboard/developer/acme/apps/app_acme_planner");
  await page.getByLabel("Name", { exact: true }).fill("Planner Pro");
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByText("Settings saved.")).toBeVisible();

  await page.goto("/dashboard/developer/acme/audit");
  await expect(page.getByTestId("audit-entries").getByRole("listitem").first()).toContainText("app.update");
});

test("the audit log needs audit.view", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/globex/audit");
  await expect(page.getByText("Requires the audit.view permission")).toBeVisible();
});

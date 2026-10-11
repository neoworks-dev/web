import { expect, test } from "./fixtures";

test("a user without a handle is asked to pick one, and is told it is permanent", async ({ page, signInAsNewcomer }) => {
  await signInAsNewcomer();
  await page.goto("/dashboard/developer");

  await expect(page).toHaveURL(/\/dashboard\/developer\/handle$/);
  await expect(page.getByText("A handle is permanent.")).toBeVisible();

  await page.getByLabel("Handle").fill("acme");
  await expect(page.getByTestId("handle-availability")).toContainText("Already taken");
  await page.getByLabel("Handle").fill("neoworks-fan");
  await expect(page.getByTestId("handle-availability")).toContainText("Reserved");

  await page.getByLabel("Handle").fill("newcomer");
  await expect(page.getByTestId("handle-availability")).toContainText("Available");
  await page.getByRole("button", { name: "Claim handle permanently" }).click();

  await expect(page).toHaveURL(/\/dashboard\/developer\/newcomer$/);
  await expect(page.getByRole("heading", { name: "New Comer" })).toBeVisible();
});

test("a taken handle is refused with the server's message", async ({ page, signInAsNewcomer }) => {
  await signInAsNewcomer();
  await page.goto("/dashboard/developer/handle");

  await page.getByLabel("Handle").fill("alice");
  await page.getByRole("button", { name: "Claim handle permanently" }).click();

  await expect(page.getByRole("alert")).toContainText("that handle is taken");
  await expect(page).toHaveURL(/\/handle$/);
});

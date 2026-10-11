import { REVIEWER_TOKEN } from "../support/developerApiStubWorld";
import { expect, test } from "./fixtures";

test("only administrators see the review link and the review page", async ({ page, signInAs, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/connected-apps");
  await expect(page.getByRole("link", { name: "App reviews" })).toHaveCount(0);
  await page.goto("/dashboard/admin/reviews");
  await expect(page.getByText("this needs the platform.admin permission")).toBeVisible();

  await signInAs(REVIEWER_TOKEN);
  await page.goto("/dashboard/connected-apps");
  await expect(page.getByRole("link", { name: "App reviews" })).toBeVisible();
});

async function moritzSubmitsPlanner(page: import("@playwright/test").Page) {
  await page.goto("/dashboard/developer/acme/apps/app_acme_planner/review");
  await page.getByLabel("Privacy policy URL").fill("https://planner.acme.example/privacy");
  await page.getByLabel("Support contact").fill("support@acme.example");
  await page.getByRole("button", { name: "Submit for review" }).click();
  await expect(page.getByText("In review").first()).toBeVisible();
}

test("a submitted app is approved by an administrator and the developer sees it", async ({ page, signInAs, signInAsMoritz }) => {
  await signInAsMoritz();
  await moritzSubmitsPlanner(page);

  await signInAs(REVIEWER_TOKEN);
  await page.goto("/dashboard/admin/reviews");
  const item = page.getByTestId("review-app_acme_planner");
  await expect(item).toContainText("https://planner.acme.example/privacy");
  await expect(item).toContainText("support@acme.example");
  await item.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByTestId("review-app_acme_planner")).toHaveCount(0);

  await signInAsMoritz();
  await page.goto("/dashboard/developer/acme/apps/app_acme_planner/review");
  await expect(page.getByText("Approved").first()).toBeVisible();
});

test("rejecting and suspending need a reason the developer then sees", async ({ page, signInAs, signInAsMoritz }) => {
  await signInAsMoritz();
  await moritzSubmitsPlanner(page);

  await signInAs(REVIEWER_TOKEN);
  await page.goto("/dashboard/admin/reviews");
  const item = page.getByTestId("review-app_acme_planner");
  await item.getByRole("button", { name: "Reject" }).click();
  await expect(item.getByRole("alert")).toContainText("tell the developer why");
  await item.getByLabel("Reason to reject").fill("Name the data you store in the privacy policy.");
  await item.getByRole("button", { name: "Reject" }).click();
  await expect(page.getByTestId("review-app_acme_planner")).toHaveCount(0);

  await signInAsMoritz();
  await page.goto("/dashboard/developer/acme/apps/app_acme_planner/review");
  await expect(page.getByText("Name the data you store in the privacy policy.")).toBeVisible();

  await signInAs(REVIEWER_TOKEN);
  await page.goto("/dashboard/admin/reviews?status=approved");
  const approved = page.getByTestId("review-app_acme_recipes");
  await approved.getByLabel("Reason to suspend").fill("Abuse reports.");
  await approved.getByRole("button", { name: "Suspend" }).click();
  await page.goto("/dashboard/admin/reviews?status=suspended");
  await expect(page.getByTestId("review-app_acme_recipes")).toContainText("Abuse reports.");
  await expect(page.getByTestId("review-app_acme_recipes").getByRole("button", { name: "Lift suspension" })).toBeVisible();
});

test("an organization is verified and the mark can be withdrawn", async ({ page, signInAs }) => {
  await signInAs(REVIEWER_TOKEN);
  await page.goto("/dashboard/admin/reviews?status=approved");
  const item = page.getByTestId("review-app_acme_recipes");
  await item.getByRole("button", { name: "Verify organization" }).click();
  await expect(item).toContainText("Verified organization");
  await item.getByRole("button", { name: "Withdraw organization verification" }).click();
  await expect(item.getByRole("button", { name: "Verify organization" })).toBeVisible();
});

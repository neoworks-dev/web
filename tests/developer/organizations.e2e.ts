import { expect, test } from "./fixtures";

test("creating an organization lands on it with every permission", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/organizations/new");

  await page.getByLabel("Organization handle").fill("studio");
  await page.getByLabel("Display name").fill("Studio One");
  await page.getByRole("button", { name: "Create organization" }).click();

  await expect(page).toHaveURL(/\/dashboard\/developer\/studio$/);
  await expect(page.getByRole("heading", { name: "Studio One" })).toBeVisible();
  await expect(page.getByTestId("owner-switcher")).toContainText("Studio One");

  await page.goto("/dashboard/developer/studio/members");
  await expect(page.getByTestId("member-user-moritz")).toContainText("You");
  await expect(page.getByTestId("member-user-moritz")).toContainText("members.manage (organization-wide)");
});

test("an organization handle that is taken or reserved is refused", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/organizations/new");

  await page.getByLabel("Organization handle").fill("acme");
  await page.getByLabel("Display name").fill("Another Acme");
  await page.getByRole("button", { name: "Create organization" }).click();
  await expect(page.getByRole("alert")).toContainText("that handle is taken");

  await page.getByLabel("Organization handle").fill("neoworks-labs");
  await page.getByRole("button", { name: "Create organization" }).click();
  await expect(page.getByRole("alert")).toContainText("that handle is reserved");
});

test("a user without a handle cannot create an organization", async ({ page, request, stubUrl }) => {
  const response = await request.post(`${stubUrl}/api/v1/organizations`, {
    headers: { Authorization: "Bearer stub-token-newcomer" },
    data: { handle: "newco", displayName: "New Co" },
  });
  expect(response.status()).toBe(409);
  expect((await response.json()).error).toBe("handle_required");
});

test("the switcher moves between personal and organization contexts", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/moritz");

  await page.getByTestId("owner-switcher").getByRole("button").click();
  await page.getByRole("option", { name: /Acme Inc/ }).click();

  await expect(page).toHaveURL(/\/dashboard\/developer\/acme$/);
  await expect(page.getByRole("link", { name: "Members" })).toBeVisible();
});

test("accepting an invitation makes the organization appear", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/invitations");

  const invitation = page.getByTestId("invitation-initech");
  await expect(invitation).toContainText("Initech");
  await expect(invitation).toContainText("usage.view (organization-wide)");
  await invitation.getByRole("button", { name: "Accept" }).click();
  await expect(invitation).toBeHidden();

  await page.goto("/dashboard/developer/initech");
  await expect(page.getByRole("heading", { name: "Initech" })).toBeVisible();
  await expect(page.getByTestId("owner-switcher")).toContainText("Initech");
});

test("declining an invitation removes it", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/invitations");

  await page.getByTestId("invitation-initech").getByRole("button", { name: "Decline" }).click();
  await expect(page.getByText("No pending invitations.")).toBeVisible();
});

test("an organization without apps can be archived and leaves the switcher", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/organizations/new");
  await page.getByLabel("Organization handle").fill("temp-org");
  await page.getByLabel("Display name").fill("Temp Org");
  await page.getByRole("button", { name: "Create organization" }).click();
  await expect(page).toHaveURL(/\/temp-org$/);

  await page.goto("/dashboard/developer/temp-org/settings");
  await page.getByRole("button", { name: "Archive organization" }).click();

  await expect(page).toHaveURL(/\/dashboard\/developer\/moritz$/);
  await page.getByTestId("owner-switcher").getByRole("button").click();
  await expect(page.getByRole("option", { name: /Temp Org/ })).toHaveCount(0);
});

test("an organization that owns apps cannot be archived", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/acme/settings");
  await page.getByRole("button", { name: "Archive organization" }).click();
  await expect(page.getByRole("alert")).toContainText("still owns apps");
});

test("only organization.manage may archive", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/globex/settings");
  await expect(page.getByRole("button", { name: "Archive organization" })).toBeDisabled();
  await expect(page.getByText("Requires organization.manage").first()).toBeVisible();
});

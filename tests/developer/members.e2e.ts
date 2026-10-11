import { expect, test } from "./fixtures";

test("changing a member's permissions with a preset", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/acme/members");

  const alice = page.getByTestId("member-user-alice");
  await expect(alice).toContainText("apps.edit (organization-wide)");
  await alice.getByRole("button", { name: "Edit permissions" }).click();
  await alice.getByRole("button", { name: "Viewer" }).click();
  await alice.getByRole("button", { name: "Save permissions" }).click();

  await expect(alice.getByRole("button", { name: "Edit permissions" })).toBeVisible();
  await expect(alice).toContainText("usage.view (organization-wide)");
  await expect(alice).not.toContainText("apps.edit");
});

test("granting more than you hold is refused as an escalation", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/globex/members");

  const carol = page.getByTestId("member-user-carol");
  await carol.getByRole("button", { name: "Edit permissions" }).click();
  await carol.getByLabel("apps.edit organization-wide").check();
  await carol.getByRole("button", { name: "Save permissions" }).click();

  await expect(carol.getByRole("alert")).toContainText("you can only grant or remove permissions you hold");
});

test("the last members manager cannot lose the permission or leave", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/globex/members");

  const own = page.getByTestId("member-user-moritz");
  await own.getByRole("button", { name: "Edit permissions" }).click();
  await own.getByLabel("members.manage organization-wide").uncheck();
  await own.getByRole("button", { name: "Save permissions" }).click();
  await expect(own.getByRole("alert")).toContainText("at least one member with members.manage");

  await own.getByRole("button", { name: "Cancel" }).click();
  await own.getByRole("button", { name: "Leave" }).click();
  await expect(own.getByRole("alert")).toContainText("at least one member with members.manage");
});

test("removing a member whose grants you do not hold is an escalation", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/globex/members");

  await page.getByTestId("member-user-carol").getByRole("button", { name: "Remove" }).click();
  await expect(page.getByTestId("member-user-carol").getByRole("alert")).toContainText("you can only grant or remove");
});

test("removing a member with narrower grants works", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/acme/members");

  await page.getByTestId("member-user-bob").getByRole("button", { name: "Remove" }).click();
  await expect(page.getByTestId("member-user-bob")).toHaveCount(0);
});

test("inviting by email lists a pending invitation that can be revoked", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/acme/members");

  await page.getByRole("button", { name: "Send invitation" }).click();
  await expect(page.getByRole("alert")).toContainText("give either a valid email address or a contact code");

  await page.getByLabel("Email").fill("new@person.example");
  await page.getByRole("button", { name: "Send invitation" }).click();
  const pending = page.getByText("new@person.example").locator("xpath=ancestor::div[starts-with(@data-testid,'pending-')]");
  await expect(pending).toContainText("usage.view (organization-wide)");

  await pending.getByRole("button", { name: "Revoke" }).click();
  await expect(page.getByText("No pending invitations.")).toBeVisible();
});

test("an unknown contact code is refused", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/acme/members");

  await page.getByLabel("Contact code").fill("NOPE-0000");
  await page.getByRole("button", { name: "Send invitation" }).click();
  await expect(page.getByRole("alert")).toContainText("no account has that contact code");
});

test("members without members.manage see disabled actions naming it", async ({ page, signInAs }) => {
  await signInAs("stub-token-alice");
  await page.goto("/dashboard/developer/acme/members");

  await expect(page.getByTestId("member-user-bob").getByRole("button", { name: "Edit permissions" })).toBeDisabled();
  await expect(page.getByTestId("member-user-bob").getByRole("button", { name: "Remove" })).toBeDisabled();
  await expect(page.getByText("Requires members.manage").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Send invitation" })).toBeDisabled();
  await expect(page.getByText("Pending invitations")).toHaveCount(0);
});

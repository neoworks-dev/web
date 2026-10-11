import { expect, test } from "./fixtures";

test("adding a domain shows its DNS record, and verifying marks it verified", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/acme/domains");

  await page.getByPlaceholder("example.com").fill("Example.org");
  await page.getByLabel("DNS TXT record").check();
  await page.getByRole("button", { name: "Add domain" }).click();

  const row = page.getByTestId("domain-example.org");
  await expect(row).toContainText("Not verified");
  await expect(row).toContainText("DNS TXT record");
  await expect(row.getByTestId("verification-token")).toContainText("neoworks-verify=");

  await row.getByRole("button", { name: "Verify" }).click();
  await expect(row).toContainText("Verified");
  await expect(row.getByTestId("verification-token")).toHaveCount(0);
});

test("a .well-known domain shows the file to serve, and a failed check says so", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/acme/domains");

  await page.getByPlaceholder("example.com").fill("unverified.example.net");
  await page.getByLabel("File under /.well-known/").check();
  await page.getByRole("button", { name: "Add domain" }).click();

  const row = page.getByTestId("domain-unverified.example.net");
  await expect(row).toContainText("/.well-known/");
  await row.getByRole("button", { name: "Verify" }).click();
  await expect(row.getByRole("alert")).toContainText("Could not find the proof");
  await expect(row).toContainText("Not verified");
});

test("an invalid or repeated domain is refused", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/acme/domains");

  await page.getByPlaceholder("example.com").fill("not a domain");
  await page.getByRole("button", { name: "Add domain" }).click();
  await expect(page.getByRole("alert")).toContainText("enter a domain such as example.com");

  await page.getByPlaceholder("example.com").fill("acme.example");
  await page.getByRole("button", { name: "Add domain" }).click();
  await expect(page.getByRole("alert")).toContainText("was already added");
});

test("a domain can be removed", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/acme/domains");

  await page.getByTestId("domain-docs.acme.example").getByRole("button", { name: "Remove" }).click();
  await expect(page.getByTestId("domain-docs.acme.example")).toHaveCount(0);
});

test("domain actions need domains.manage", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/globex/domains");

  await expect(page.getByRole("button", { name: "Add domain" })).toBeDisabled();
  await expect(page.getByText("Requires domains.manage")).toBeVisible();
});

test("verifying the domain of the redirect URIs verifies the app", async ({ page, signInAsMoritz }) => {
  await signInAsMoritz();
  await page.goto("/dashboard/developer/acme/apps/app_acme_planner/review");
  await expect(page.getByText("Unverified").first()).toBeVisible();
  await page.goto("/dashboard/developer/acme/apps/app_acme_recipes/review");
  await expect(page.getByText("Verified").first()).toBeVisible();
});

import { expect, test } from "@playwright/test";

const PROTECTED_PAGE = [
  "/",
  "/kandidat",
  "/kandidat/tambah",
  "/peserta",
  "/peserta/tambah",
  "/peserta/csv",
  "/peserta/pdf",
  "/peserta/qr",
  "/statistik",
  "/pengaturan",
];

for (const pageUrl of PROTECTED_PAGE) {
  test(`Redirected from "${pageUrl}" to "/login" page`, async ({ page }) => {
    await page.goto(pageUrl);

    const heading = page.locator("h2");

    await heading.waitFor();

    await expect(page.locator("h2")).toContainText("Login Administrator");

    expect(page.url().includes("/login")).toBe(true);
  });
}

test("Navigate from login page to registration page", async ({ page }) => {
  await page.goto("/login");

  await page.getByRole("link", { name: "Daftar" }).click();

  const heading = page.locator("h2");

  await heading.waitFor();

  await expect(page.locator("h2")).toContainText("Register Administrator");
  await expect(page).toHaveURL("/register");
});

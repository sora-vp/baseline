import { expect, test, type Page } from "@playwright/test";

import { prisma } from "@sora/db";

test.describe.configure({ mode: "serial" });

let page: Page;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();

  // Login process
  await page.goto("/login");

  await expect(page.locator("h2")).toContainText("Login Administrator");
  await expect(page).toHaveURL("/login");

  await page.locator('input[type="text"]').type("test123@mail.com");
  await page.locator('input[type="password"]').type("123456");

  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByRole("button", { name: "Login" })).toBeDisabled();

  await page.waitForURL("/");
  await expect(page).toHaveURL("/");

  await page.getByRole("link").filter({ hasText: "Kandidat" }).click();

  await page.waitForURL("/kandidat");

  await page.getByRole("paragraph").filter({ hasText: "Kandidat" }).waitFor();

  await expect(
    page.getByRole("paragraph").filter({ hasText: "Kandidat" }),
  ).toBeVisible();

  await expect(page).toHaveURL("/kandidat");
});

test.afterAll(async () => {
  await page.close();
});

test("Create new candidate", async () => {});

import { expect, test as setup } from "@playwright/test";

import { prisma } from "@sora/db";

const authFile = "e2e/.auth/storageState.json";

setup("authenticate", async ({ page }) => {
  await prisma.$connect();

  const userIsAvail = await prisma.user.findUnique({
    where: { email: "test123@mail.com" },
  });

  if (userIsAvail)
    await prisma.user.delete({
      where: { email: "test123@mail.com" },
    });

  await prisma.$disconnect();

  await page.goto("/register");

  await expect(page.locator("h2")).toContainText("Register Administrator");
  await expect(page).toHaveURL("/register");

  await page.locator('input[type="text"]').first().type("test123@mail.com");
  await page.locator('input[type="text"]').nth(1).type("User Test");

  await page.locator('input[type="password"]').first().type("123456");
  await page.locator('input[type="password"]').nth(1).type("123456");

  await page.getByRole("button", { name: "Register" }).click();

  await expect(page.getByRole("button", { name: "Register" })).toHaveAttribute(
    "disabled",
    "",
  );

  await page.waitForURL("/login");

  await expect(page.locator("h2")).toContainText("Login Administrator");
  await expect(page).toHaveURL("/login");

  await page.locator('input[type="text"]').type("test123@mail.com");
  await page.locator('input[type="password"]').type("123456");

  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByRole("button", { name: "Login" })).toBeDisabled();

  await page.waitForURL("/");
  await expect(page).toHaveURL("/");

  await page.locator('[id="__next"]').getByText("Dashboard Admin").waitFor();
  await expect(
    page.locator('[id="__next"]').getByText("Dashboard Admin"),
  ).toBeVisible();

  await page.context().storageState({ path: authFile });
});

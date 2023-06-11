import { expect, test, type Page } from "@playwright/test";

import { prisma } from "@sora/db";

test.describe("There will be a redirection", () => {
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
});

test.describe("Navigate from login to register and vice versa", () => {
  test("Navigate from login page to registration page", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("link", { name: "Daftar" }).click();

    const heading = page.locator("h2");

    await heading.waitFor();

    await expect(page.locator("h2")).toContainText("Register Administrator");
    await expect(page).toHaveURL("/register");
  });

  test("Navigate from registration page to login  page", async ({ page }) => {
    await page.goto("/register");

    await page.getByRole("link", { name: "Login" }).click();

    const heading = page.locator("h2");

    await heading.waitFor();

    await expect(page.locator("h2")).toContainText("Login Administrator");
    await expect(page).toHaveURL("/login");
  });
});

// For login and registration page
const invalidEmailInputs = ["dsdsasd", "test@", "eee@mail", "aaa.com"];

test.describe("Check login page form validation", () => {
  const goToLogin = async (page: Page) => {
    await page.goto("/login");

    await expect(page.locator("h2")).toContainText("Login Administrator");
    await expect(page).toHaveURL("/login");
  };

  test("All input box should complain", async ({ page }) => {
    await goToLogin(page);

    await page.getByRole("button", { name: "Login" }).click();

    await expect(
      page.locator("div.chakra-form__error-message").first(),
    ).toHaveText("Bidang email harus di isi!");
    await expect(
      page.locator("div.chakra-form__error-message").nth(1),
    ).toHaveText("Kata sandi harus di isi!");
  });

  for (const input of invalidEmailInputs) {
    test(`Email input isn't a valid email, input: ${input}`, async ({
      page,
    }) => {
      await goToLogin(page);

      await page.locator('input[type="text"]').type(input);

      await page.getByRole("button", { name: "Login" }).click();

      await expect(
        page.locator("div.chakra-form__error-message").first(),
      ).toHaveText("Bidang email harus berupa email yang valid!");
    });
  }

  test("Password input at least 6 characters long", async ({ page }) => {
    await goToLogin(page);

    await page.locator('input[type="password"]').type("abcde");

    await page.getByRole("button", { name: "Login" }).click();

    await expect(
      page.locator("div.chakra-form__error-message").nth(1),
    ).toHaveText("Kata sandi memiliki panjang setidaknya 6 karakter!");
  });

  test("All input box wouldn't complain", async ({ page }) => {
    await goToLogin(page);

    await page.locator('input[type="text"]').type("test123@mail.com");
    await page.locator('input[type="password"]').type("123456");

    await page.getByRole("button", { name: "Login" }).click();

    await expect(page.getByRole("button", { name: "Login" })).toHaveAttribute(
      "disabled",
      "",
    );
    await expect(page.getByRole("button", { name: "Login" })).toHaveAttribute(
      "data-loading",
      "",
    );
  });
});

test.describe("Check registration page form validation", () => {
  const goToRegistration = async (page: Page) => {
    await page.goto("/register");

    await expect(page.locator("h2")).toContainText("Register Administrator");
    await expect(page).toHaveURL("/register");
  };

  test("All input box should complain", async ({ page }) => {
    await goToRegistration(page);

    await page.getByRole("button", { name: "Register" }).click();

    await expect(
      page.locator("div.chakra-form__error-message").first(),
    ).toHaveText("Bidang email harus di isi!");
    await expect(
      page.locator("div.chakra-form__error-message").nth(1),
    ).toHaveText("Bidang nama harus di isi!");
    await expect(
      page.locator("div.chakra-form__error-message").nth(2),
    ).toHaveText("Kata sandi harus di isi!");
    await expect(
      page.locator("div.chakra-form__error-message").nth(3),
    ).toHaveText("Konfirmasi kata sandi diperlukan setidaknya 6 karakter!");
  });

  for (const input of invalidEmailInputs) {
    test(`Email input isn't a valid email, input: ${input}`, async ({
      page,
    }) => {
      await goToRegistration(page);

      await page.locator('input[type="text"]').first().type(input);

      await page.getByRole("button", { name: "Register" }).click();

      await expect(
        page.locator("div.chakra-form__error-message").first(),
      ).toHaveText("Bidang email harus berupa email yang valid!");
    });
  }

  test("All input box wouldn't complain and test registration ability", async ({
    page,
  }) => {
    await prisma.$connect();

    // Delete all users before inserting new one
    await prisma.user.deleteMany();

    await goToRegistration(page);

    await page.locator('input[type="text"]').first().type("test123@mail.com");
    await page.locator('input[type="text"]').nth(1).type("User Test");

    await page.locator('input[type="password"]').first().type("123456");
    await page.locator('input[type="password"]').nth(1).type("123456");

    await page.getByRole("button", { name: "Register" }).click();

    await expect(
      page.getByRole("button", { name: "Register" }),
    ).toHaveAttribute("disabled", "");

    const heading = page.locator("h2");

    await heading.waitFor();

    await expect(page.locator("h2")).toContainText("Login Administrator");

    expect(page.url().includes("/login")).toBe(true);

    const user = await prisma.user.findUnique({
      where: {
        email: "test123@mail.com",
      },
    });

    expect(user).not.toBeNull();
    await prisma.$disconnect();
  });
});

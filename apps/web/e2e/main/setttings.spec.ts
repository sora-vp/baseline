import { expect, test, type Page } from "@playwright/test";

// import { prisma } from "@sora/db";

test.describe.configure({ mode: "serial" });

const goToSettingsPage = async (page: Page) => {
  await page.goto("/pengaturan");

  await page.getByRole("paragraph").filter({ hasText: "Pengaturan" }).waitFor();

  // Sudah Bisa Memilih
  await expect(
    page
      .getByRole("group")
      .filter({ hasText: "Sudah Bisa Memilih" })
      .locator("span")
      .first(),
  ).toBeVisible();

  // Sudah Bisa Absen
  await expect(page.getByPlaceholder("Tetapkan waktu mulai")).toBeVisible();

  await expect(page.getByPlaceholder("Tetapkan waktu selesai")).toBeVisible();
};

test("/pengaturan", async ({ page }) => {
  await goToSettingsPage(page);
});

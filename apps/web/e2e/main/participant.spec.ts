import { expect, test, type Page } from "@playwright/test";

// import { prisma } from "@sora/db";

test.describe.configure({ mode: "serial" });

const goToParticipantPage = async (page: Page) => {
  await page.goto("/peserta");

  await page.getByText("Peserta Pemilih").waitFor();

  await expect(
    page.getByRole("button", { name: "Tambah Peserta Baru" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Upload File CSV" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Cetak PDF" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Buat QR Dadakan" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Export JSON" })).toBeVisible();
};

test("/peserta", async ({ page }) => {
  await goToParticipantPage(page);
});

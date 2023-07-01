import { expect, test, type Page } from "@playwright/test";

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

test.describe("Time behaviour settings test", () => {
  const ensureNotChecked = async (page: Page) => {
    await goToSettingsPage(page);

    await expect(page.getByPlaceholder("Tetapkan waktu mulai")).toHaveValue("");
    await expect(page.getByPlaceholder("Tetapkan waktu selesai")).toHaveValue(
      "",
    );

    const saveBtn = page.getByRole("button", { name: "Simpan" }).nth(1);

    return { saveBtn };
  };

  test("All time settings would complain because it's empty", async ({
    page,
  }) => {
    const { saveBtn } = await ensureNotChecked(page);

    await saveBtn.click();

    await page.getByText("Diperlukan kapan waktu mulai pemilihan!").waitFor();
    await page.getByText("Diperlukan kapan waktu selesai pemilihan!").waitFor();

    await expect(
      page.getByText("Diperlukan kapan waktu mulai pemilihan!"),
    ).toBeVisible();
    await expect(
      page.getByText("Diperlukan kapan waktu selesai pemilihan!"),
    ).toBeVisible();
  });

  test("Set start time at 7:30 AM and ended at 12:00 PM", async ({ page }) => {
    const { saveBtn } = await ensureNotChecked(page);

    await page.getByPlaceholder("Tetapkan waktu mulai").click();

    await page.getByText("7:30 AM").waitFor();
    await page.getByText("7:30 AM").scrollIntoViewIfNeeded();

    await expect(page.getByText("7:30 AM")).toBeVisible();

    await page.getByText("7:30 AM").click();

    // As long as a text
    await expect(page.getByPlaceholder("Tetapkan waktu mulai")).toHaveValue(
      /.*/,
    );

    await page.getByPlaceholder("Tetapkan waktu selesai").click();

    await page.getByText("12:00 PM").waitFor();
    await page.getByText("12:00 PM").scrollIntoViewIfNeeded();

    await expect(page.getByText("12:00 PM")).toBeVisible();

    await page.getByText("12:00 PM").click();

    await expect(page.getByPlaceholder("Tetapkan waktu selesai")).toHaveValue(
      /.*/,
    );

    await saveBtn.click();
  });
});

test("You can turn on the entire behaviour settings", async ({ page }) => {
  await goToSettingsPage(page);

  await page
    .getByRole("group")
    .filter({ hasText: "Sudah Bisa Memilih" })
    .locator("span")
    .first()
    .click();

  await page
    .getByRole("group")
    .filter({ hasText: "Sudah Bisa Absen" })
    .locator("span")
    .first()
    .click();

  await page.getByRole("button", { name: "Simpan" }).first().click();
});

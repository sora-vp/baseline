import { expect, test, type Page } from "@playwright/test";

import { prisma } from "@sora/db";

test.describe("Add new candidate page testing", () => {
  const goToCandidateAddPage = async (page: Page) => {
    await page.goto("/kandidat");

    await page
      .getByRole("button", { name: "Tambah Kandidat Baru", disabled: false })
      .waitFor();
    await page
      .getByRole("button", { name: "Tambah Kandidat Baru", disabled: false })
      .click();

    await page.waitForURL("/kandidat/tambah");

    await page
      .getByRole("paragraph")
      .filter({ hasText: "Tambah Kandidat Baru" })
      .waitFor();

    await expect(
      page.getByRole("paragraph").filter({ hasText: "Tambah Kandidat Baru" }),
    ).toBeVisible();
  };

  test("Check form validation", async ({ page }) => {
    await goToCandidateAddPage(page);

    await expect(page.getByRole("button", { name: "Tambah" })).toBeVisible();

    await page.getByRole("button", { name: "Tambah" }).click();

    await expect(page.getByText("Diperlukan nama kandidat!")).toBeVisible();
    await expect(page.getByText("Diperlukan gambar kandidat!")).toBeVisible();
  });

  test("Invalid file format, can only upload .jpg, .jpeg, .png and .webp", async ({
    page,
  }) => {
    await goToCandidateAddPage(page);

    await expect(page.getByRole("button", { name: "Tambah" })).toBeVisible();

    await page.setInputFiles('input[type="file"]', "e2e/beforeLogin.test.ts");

    await page.getByRole("button", { name: "Tambah" }).click();

    await expect(
      page.getByText(
        "Hanya format gambar .jpg, .jpeg, .png dan .webp yang diterima!",
      ),
    ).toBeVisible();
  });

  test("Create new candidate", async ({ page }) => {
    await prisma.$connect();

    const candidateIsAvail = await prisma.candidate.findUnique({
      where: { name: "Entonk" },
    });

    if (candidateIsAvail)
      await prisma.candidate.delete({
        where: { name: "Entonk" },
      });

    await prisma.$disconnect();

    await goToCandidateAddPage(page);

    await page.getByPlaceholder("Masukan Nama Kandidat").type("Entonk");
    await page.setInputFiles(
      'input[type="file"]',
      "../../assets/samples/Kandidat Nama Orang/1_Entonk.png",
    );

    await page.getByRole("button", { name: "Tambah" }).click();

    await expect(page.getByRole("button", { name: "Tambah" })).toBeDisabled();

    await page
      .getByRole("button", { name: "Tambah", disabled: false })
      .waitFor();

    await page.waitForURL("/kandidat");

    await page.getByRole("button", { name: "Tambah Kandidat Baru" }).waitFor();

    await expect(
      page.getByRole("button", { name: "Tambah Kandidat Baru" }),
    ).toBeVisible();

    await page.getByText("Entonk").waitFor();
    await expect(page.getByText("Entonk")).toBeVisible();
  });
});

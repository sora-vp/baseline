import { expect, test, type Page } from "@playwright/test";

import { prisma } from "@sora/db";

test.describe.configure({ mode: "serial" });

const goToCandidatePage = async (page: Page) => {
  await page.goto("/kandidat");

  await page
    .getByRole("button", { name: "Tambah Kandidat Baru", disabled: false })
    .waitFor();
  await page.getByRole("paragraph").filter({ hasText: "Kandidat" }).waitFor();

  await expect(
    page.getByRole("button", { name: "Tambah Kandidat Baru", disabled: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("paragraph").filter({ hasText: "Kandidat" }),
  ).toBeVisible();
};

test.describe("Add new candidate page testing", () => {
  const goToCandidateAddPage = async (page: Page) => {
    await goToCandidatePage(page);

    await page
      .getByRole("button", {
        name: "Tambah Kandidat Baru",
      })
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
    await expect(page.getByText("0 Orang")).toBeVisible();
    await expect(
      page.getByRole("img", { name: "Gambar dari kandidat Entonk." }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Edit" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Hapus" })).toBeVisible();
  });
});

test.describe("Edit page functionality testing", () => {
  test("Candidate name can't be empty", async ({ page }) => {
    await goToCandidatePage(page);

    // Waiting for Entonk candidate
    await page.getByText("Entonk").waitFor();

    // Ensure entire information is visible
    await expect(page.getByText("Entonk")).toBeVisible();
    await expect(page.getByText("0 Orang")).toBeVisible();
    await expect(
      page.getByRole("img", { name: "Gambar dari kandidat Entonk." }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Edit" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Hapus" })).toBeVisible();

    // Real test start from here
    await page.getByRole("button", { name: "Edit" }).click();

    await page.getByPlaceholder("Masukan Nama Kandidat").waitFor();
    await page.locator('input[type="file"]').waitFor();

    await expect(page.getByPlaceholder("Masukan Nama Kandidat")).toHaveValue(
      "Entonk",
    );

    await page.getByPlaceholder("Masukan Nama Kandidat").clear();

    await page.getByRole("button", { name: "Edit" }).click();

    await page.getByText("Diperlukan nama kandidat!").waitFor();

    await expect(page.getByText("Diperlukan nama kandidat!")).toBeVisible();
  });

  test("Update candidate name to Ujang", async ({ page }) => {
    await goToCandidatePage(page);

    // Waiting for Entonk candidate
    await page.getByText("Entonk").waitFor();

    // Ensure entire information is visible
    await expect(page.getByText("Entonk")).toBeVisible();
    await expect(page.getByText("0 Orang")).toBeVisible();
    await expect(
      page.getByRole("img", { name: "Gambar dari kandidat Entonk." }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Edit" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Hapus" })).toBeVisible();

    // Real test start from here, changes Entonk -> Ujang
    await page.getByRole("button", { name: "Edit" }).click();

    await page.getByPlaceholder("Masukan Nama Kandidat").waitFor();
    await page.locator('input[type="file"]').waitFor();

    await expect(page.getByPlaceholder("Masukan Nama Kandidat")).toHaveValue(
      "Entonk",
    );

    await page.getByPlaceholder("Masukan Nama Kandidat").clear();
    await page.getByPlaceholder("Masukan Nama Kandidat").type("Ujang");

    await page.getByRole("button", { name: "Edit" }).click();

    await page.waitForURL("/kandidat");

    await page.getByRole("button", { name: "Tambah Kandidat Baru" }).waitFor();

    await expect(
      page.getByRole("button", { name: "Tambah Kandidat Baru" }),
    ).toBeVisible();

    await page.getByText("Ujang").waitFor();

    await expect(page.getByText("Ujang")).toBeVisible();
    await expect(page.getByText("0 Orang")).toBeVisible();
    await expect(
      page.getByRole("img", { name: "Gambar dari kandidat Ujang." }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Edit" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Hapus" })).toBeVisible();
  });
});

test("Delete candidate from available list", async ({ page }) => {
  await goToCandidatePage(page);

  // Waiting for Ujang candidate
  await page.getByText("Ujang").waitFor();

  // Ensure entire information is visible
  await expect(page.getByText("Ujang")).toBeVisible();
  await expect(page.getByText("0 Orang")).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Gambar dari kandidat Ujang." }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Edit" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Hapus" })).toBeVisible();

  await page.getByRole("button", { name: "Hapus" }).click();

  await page.getByText("Hapus Kandidat").waitFor();

  await expect(page.getByText("Hapus Kandidat")).toBeVisible();
  await expect(page.getByRole("button", { name: "Batal" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Hapus" })).toBeVisible();

  await page.getByRole("button", { name: "Hapus" }).click();

  await page
    .getByText(
      "Tidak ada kandidat yang tersedia, silahkan tambahkan kandidat terlebih dahulu.",
    )
    .waitFor();

  await expect(
    page.getByText(
      "Tidak ada kandidat yang tersedia, silahkan tambahkan kandidat terlebih dahulu.",
    ),
  ).toBeVisible();
});

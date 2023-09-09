import { expect, test, type Page } from "@playwright/test";

import { prisma } from "@sora/db";

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

test.describe("Test create single participant", () => {
  const goToCreateParticipantPage = async (page: Page) => {
    const availParticipant = await prisma.participant.count();

    if (availParticipant > 0) await prisma.participant.deleteMany();

    await goToParticipantPage(page);

    await expect(
      page.getByText(
        "Tidak ada data peserta, Silahkan tambah peserta baru dengan tombol di atas.",
      ),
    ).toBeVisible();

    await page.getByRole("link", { name: "Tambah Peserta Baru" }).click();

    await page.getByText("Nama Peserta").waitFor();

    await expect(page.getByText("Nama Peserta")).toBeVisible();
    await expect(page).toHaveURL("/peserta/tambah");
  };

  test("All form inputs will throw an error empty value", async ({ page }) => {
    await goToCreateParticipantPage(page);

    await page.getByRole("button", { name: "Tambah" }).click();

    await expect(page.getByText("Diperlukan nama peserta!")).toBeVisible();
    await expect(
      page.getByText("Diperlukan bagian darimana peserta ini!"),
    ).toBeVisible();
  });

  test("Can't type weird name and part of fields", async ({ page }) => {
    await goToCreateParticipantPage(page);

    await page.getByPlaceholder("Masukan Nama Peserta").type("!@#$%^&*()_+");
    await page
      .getByPlaceholder("Masukan Peserta Bagian Dari")
      .type("!@#$%^&*()_+");

    await page.getByRole("button", { name: "Tambah" }).click();

    await expect(
      page.getByText(
        "Hanya diperbolehkan menulis alfabet, angka, koma, petik satu, dan titik!",
      ),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Hanya diperbolehkan menulis alfabet, angka, dan garis bawah!",
      ),
    ).toBeVisible();
  });

  test("Create new single participant", async ({ page }) => {
    await goToCreateParticipantPage(page);

    await page.getByPlaceholder("Masukan Nama Peserta").type("Fiqri");
    await page
      .getByPlaceholder("Masukan Peserta Bagian Dari")
      .type("XII-IPA-4");

    await page.getByRole("button", { name: "Tambah" }).click();

    await page.waitForURL("/peserta");

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
    await expect(
      page.getByRole("button", { name: "Export JSON" }),
    ).toBeVisible();

    await expect(page.getByText("Fiqri")).toBeVisible();
    await expect(page.getByText("XII-IPA-4")).toBeVisible();
  });
});

test("Edit individual participant", async ({ page }) => {
  await goToParticipantPage(page);

  await expect(page.getByRole("button", { name: "Edit" })).toBeVisible();

  await page.getByRole("button", { name: "Edit" }).click();

  await page.getByText("Nama Peserta").waitFor();

  await expect(page.getByText("Nama Peserta")).toBeVisible();
  await expect(page).toHaveURL(/\/peserta\/edit\/*/);

  await page.getByPlaceholder("Masukan Nama Peserta").clear();
  await page.getByPlaceholder("Masukan Peserta Bagian Dari").clear();

  await page.getByPlaceholder("Masukan Nama Peserta").type("Fiqri H.");
  await page.getByPlaceholder("Masukan Peserta Bagian Dari").type("XII-IPA-5");

  await page.getByRole("button", { name: "Ubah" }).click();

  await page.waitForURL("/peserta");

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

  await expect(page.getByText("Fiqri H.")).toBeVisible();
  await expect(page.getByText("XII-IPA-5")).toBeVisible();
});

test("Delete single participant", async ({ page }) => {
  await goToParticipantPage(page);

  await expect(page.getByRole("button", { name: "Hapus" })).toBeVisible();

  await page.getByRole("button", { name: "Hapus" }).click();

  await expect(page.getByText("Hapus Peserta")).toBeVisible();

  await page.getByRole("button", { name: "Hapus" }).click();

  await expect(
    page.getByText(
      "Tidak ada data peserta, Silahkan tambah peserta baru dengan tombol di atas.",
    ),
  ).toBeVisible();
});

test("Upload csv file", async ({ page }) => {
  await goToParticipantPage(page);

  await page.getByRole("button", { name: "Upload File CSV" }).click();

  await page.getByText("Kembali").waitFor();

  await expect(page.getByText("Kembali")).toBeVisible();
  await expect(page).toHaveURL("/peserta/csv");

  await page
    .getByPlaceholder("Masukan File CSV")
    .setInputFiles("e2e/fixtures/contoh-file-csv.csv");

  await page.getByRole("button", { name: "Tambah" }).click();

  await page.waitForURL("/peserta");

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

  await expect(page.getByText("M. Fiqri Haikal")).toBeVisible();
  await expect(page.getByText("M. Rifqi Muflih")).toBeVisible();
  await expect(page.getByText("Zain Arsi")).toBeVisible();
});

test.describe("PDF page test", () => {
  const goToPDFPage = async (page: Page) => {
    await goToParticipantPage(page);

    await page.getByRole("button", { name: "Cetak PDF" }).click();

    await expect(
      page.getByRole("heading", { name: "Peserta Pemilihan" }),
    ).toBeVisible();
    await expect(page).toHaveURL("/peserta/pdf");
  };

  test("It shows corresponding participant by selected category", async ({
    page,
  }) => {
    await goToPDFPage(page);

    await page.getByRole("combobox").selectOption("XII-IPA-5");

    await expect(page.getByText("M. Fiqri Haikal")).toBeVisible();
    await expect(page.getByText("Zain Arsi")).toBeVisible();

    await page.getByRole("combobox").selectOption("XII-BHS");

    await expect(page.getByText("M. Rifqi Muflih")).toBeVisible();
  });

  test("Will include QR Code web if there's an URL", async ({ page }) => {
    await goToPDFPage(page);

    await page.getByRole("combobox").selectOption("XII-IPA-5");

    await page
      .getByPlaceholder("Web QR Code | Misal https://example.com")
      .type("https://sora.rmecha.my.id");

    await expect(page.getByText("Klik Disini").first()).toHaveAttribute(
      "href",
      /https:\/\/sora.rmecha.my.id\/qr\/*/,
    );
    await expect(page.getByText("Klik Disini").nth(1)).toHaveAttribute(
      "href",
      /https:\/\/sora.rmecha.my.id\/qr\/*/,
    );

    await page.getByRole("combobox").selectOption("XII-BHS");

    await expect(page.getByText("Klik Disini").first()).toHaveAttribute(
      "href",
      /https:\/\/sora.rmecha.my.id\/qr\/*/,
    );
  });
});

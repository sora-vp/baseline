import type ExcelJS from "exceljs";

const conditionalFormatRules = (
  bold = false,
): ExcelJS.ConditionalFormattingRule[] => [
  {
    type: "containsText",
    operator: "containsText",
    priority: 1,
    text: "YA",
    style: {
      font: {
        bold,
        color: { argb: "36863A" },
      },
      fill: {
        type: "pattern",
        pattern: "solid",
        bgColor: { argb: "C6EFCE" },
      },
    },
  },
  {
    type: "containsText",
    operator: "containsText",
    priority: 1,
    text: "TIDAK",
    style: {
      font: {
        bold,
        color: { argb: "A91623" },
      },
      fill: {
        type: "pattern",
        pattern: "solid",
        bgColor: { argb: "FFC7CE" },
      },
    },
  },
];

function eachFunctionCenter(cell: ExcelJS.Cell) {
  cell.alignment = {
    vertical: "middle",
    horizontal: "center",
  };
}

export function excelNormalizeTime(timeToNormalize: Date) {
  const currTime = new Date();

  const offsetInHour = currTime.getHours() - currTime.getUTCHours();
  const offsetInMinute = currTime.getMinutes() - currTime.getUTCMinutes();

  return new Date(
    timeToNormalize.getTime() +
      offsetInHour * 60 * 60 * 1000 +
      offsetInMinute * 60 * 1000,
  );
}

export function participantWorksheetWorker(
  ws: ExcelJS.Worksheet,
  participantLength: number,
) {
  // Ubah lebar kolom
  ws.getColumn(1).width = 35;

  const bagianDari = ws.getColumn(2);
  bagianDari.width = 12;
  bagianDari.eachCell(eachFunctionCenter);

  const qrId = ws.getColumn(3);
  qrId.width = 4.29;
  qrId.eachCell(eachFunctionCenter);

  const sudahHadir = ws.getColumn(4);
  sudahHadir.width = 15;
  sudahHadir.eachCell(eachFunctionCenter);

  const waktuKehadiran = ws.getColumn(5);
  waktuKehadiran.width = 31;
  waktuKehadiran.numFmt = "dddd dd mmmm yyyy HH:MM:ss";
  waktuKehadiran.eachCell(eachFunctionCenter);

  const sudahMemilih = ws.getColumn(6);
  sudahMemilih.width = 15;
  sudahMemilih.eachCell(eachFunctionCenter);

  const waktuMemilih = ws.getColumn(7);
  waktuMemilih.width = 31;
  waktuMemilih.numFmt = "dddd dd mmmm yyyy HH:MM:ss";
  waktuMemilih.eachCell(eachFunctionCenter);

  ws.addConditionalFormatting({
    ref: `D2:D${participantLength}`,
    rules: conditionalFormatRules(true),
  });
  ws.addConditionalFormatting({
    ref: `F2:F${participantLength}`,
    rules: conditionalFormatRules(true),
  });
}

export function candidatesWorksheetWorker(ws: ExcelJS.Worksheet) {
  ws.getColumn(1).width = 35;

  const banyaknyaPemilih = ws.getColumn(2);
  banyaknyaPemilih.width = 18;
  banyaknyaPemilih.eachCell(eachFunctionCenter);
}

export function overviewWorksheetWorker(ws: ExcelJS.Worksheet) {
  ws.getColumn(2).width = 45;
  ws.getColumn(3).width = 23;
  ws.getColumn(4).width = 13;
  ws.getColumn(5).width = 23;
  ws.getColumn(6).width = 35;

  ws.mergeCells("C2:E2");
  ws.mergeCells("C3:E3");

  const h1 = ws.getCell("C2");
  h1.value = "RINGKASAN HASIL AKHIR";
  h1.font = {
    bold: true,
    size: 20,
  };
  h1.alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  const h2 = ws.getCell("C3");
  h2.value = "DAN STATUS PEMILIHAN";
  h2.font = {
    bold: true,
    size: 16,
  };
  h2.alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  ws.getRow(4).height = 25.5;

  /**
   * Tabel pertama yang memuat keterangan
   * umum tentang pemilihan yang sudah
   * selesai.
   */
  const titleKeterangan = ws.getCell("B5");
  titleKeterangan.value = "Keterangan";
  titleKeterangan.font = {
    bold: true,
  };

  const titleJumlahKeseluruhan = ws.getCell("C5");
  titleJumlahKeseluruhan.value = "Jumlah keseluruhan";
  titleJumlahKeseluruhan.font = {
    bold: true,
  };
  titleJumlahKeseluruhan.alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  const jumlahPemilihTetap = ws.getCell("B6");
  jumlahPemilihTetap.value = "Jumlah pemilih tetap";

  const countaNamaPartisipan = ws.getCell("C6");
  countaNamaPartisipan.value = {
    formula: "COUNTA(TabelPartisipan[Nama])",
  };

  const jumlahKandidatTetap = ws.getCell("B7");
  jumlahKandidatTetap.value = "Jumlah kandidat yang ada";

  const countaNamaKandidat = ws.getCell("C7");
  countaNamaKandidat.value = {
    formula: "COUNTA(TabelKandidat[Nama])",
  };
}

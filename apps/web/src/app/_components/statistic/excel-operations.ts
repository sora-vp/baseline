import type ExcelJS from "exceljs";

const constant = {
  // > ([5,6,7]).flatMap(n => (["B", "C"].map(a => `${a}${n}`)))
  // > ([10, 11, 12, 13, 14]).flatMap(n => (["B", "C", "D", "E", "F"].map(a => `${a}${n}`)))
  // > ([17, 18]).flatMap(n => (["C", "D", "E"].map(a => `${a}${n}`)))
  overviewNeedBorder: [
    "B5",
    "C5",
    "B6",
    "C6",
    "B7",
    "C7",

    "E5",
    "E6",
    "E7",
    "F5",
    "F6",
    "F7",

    "B10",
    "C10",
    "D10",
    "E10",
    "F10",
    "B11",
    "C11",
    "D11",
    "E11",
    "F11",
    "B12",
    "C12",
    "D12",
    "E12",
    "F12",
    "B13",
    "C13",
    "D13",
    "E13",
    "F13",
    "B14",
    "C14",
    "D14",
    "E14",
    "F14",

    "C17",
    "D17",
    "C18",
    "D18",
    "C19",
    "D19",
    "E19",
    "C21",
    "D21",
    "E21",
    "C22",
    "D22",
  ],

  // > ([5]).flatMap(n => (["B", "C"].map(a => `${a}${n}`)))
  // > ([10]).flatMap(n => (["B", "C", "D", "E", "F"].map(a => `${a}${n}`)))
  overviewHeaderNeedBold: [
    "B5",
    "C5",
    "E5",
    "E6",
    "E7",
    "B10",
    "C10",
    "D10",
    "E10",
    "F10",

    "C17",
    "C18",
    "C19",
    "D19",
    "E19",
    "C22",
    "D22",
  ],

  // > ([10]).flatMap(n => (["C", "D", "E", "F"].map(a => `${a}${n}`)))
  // >  ([11,12,13,14]).flatMap(n => (["C", "D", "E"].map(a => `${a}${n}`)))
  overviewNeedCentered: [
    "C2",
    "C3",
    "C5",

    "F5",
    "F6",
    "F7",

    "C10",
    "D10",
    "E10",
    "F10",

    "C11",
    "D11",
    "E11",
    "C12",
    "D12",
    "E12",
    "C13",
    "D13",
    "E13",
    "C14",
    "D14",
    "E14",

    "D17",
    "D18",

    "C19",
    "D19",
    "E19",
    "C21",
    "D21",
    "E21",

    "D22",
  ],

  candidateNeedBorder: ["E1", "F1", "G1", "H1", "G2", "H2"],
} as const;

const conditionalFormatRules = (
  bold = false,
  correctText = "YA",
  wrongText = "TIDAK",
): ExcelJS.ConditionalFormattingRule[] => [
  {
    type: "containsText",
    operator: "containsText",
    priority: 1,
    text: correctText,
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
    text: wrongText,
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
  /**
   * Preparasi border, posisi tebalnya text, dan teks yang wajib ketengah
   */
  for (const cell of constant.overviewNeedBorder) {
    ws.getCell(cell).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  }

  for (const cell of constant.overviewHeaderNeedBold) {
    ws.getCell(cell).font = {
      bold: true,
    };
  }

  constant.overviewNeedCentered.forEach((cell) =>
    eachFunctionCenter(ws.getCell(cell)),
  );

  ws.getColumn(1).width = 2;
  ws.getColumn(2).width = 32;
  ws.getColumn(3).width = 50;
  ws.getColumn(4).width = 26;
  ws.getColumn(5).width = 33;
  ws.getColumn(6).width = 35;

  ws.mergeCells("C2:E2");
  ws.mergeCells("C3:E3");
  ws.mergeCells("D17:E17");
  ws.mergeCells("D18:E18");
  ws.mergeCells("C19:C20");
  ws.mergeCells("D19:D20");
  ws.mergeCells("E19:E20");
  ws.mergeCells("D22:E22");

  const h1 = ws.getCell("C2");
  h1.value = "RINGKASAN HASIL AKHIR";
  h1.font = {
    bold: true,
    size: 20,
  };
  h1.border = {
    top: { style: "thin" },
    left: { style: "thin" },
    right: { style: "thin" },
  };

  const h2 = ws.getCell("C3");
  h2.value = "DAN STATUS PEMILIHAN";
  h2.font = {
    bold: true,
    size: 16,
  };
  h2.border = {
    bottom: { style: "thin" },
    left: { style: "thin" },
    right: { style: "thin" },
  };

  ws.getRow(4).height = 25.5;
  ws.getRow(21).height = 33;

  /**
   * Tabel pertama yang memuat keterangan
   * umum tentang pemilihan yang sudah
   * selesai.
   */
  ws.getCell("B5").value = "Keterangan";
  ws.getCell("C5").value = "Jumlah keseluruhan";
  ws.getCell("B6").value = "Jumlah pemilih tetap";
  ws.getCell("B7").value = "Jumlah kandidat yang ada";

  ws.getCell("C6").value = {
    formula: "COUNTA(TabelPartisipan[Nama])",
  };
  ws.getCell("C7").value = {
    formula: "COUNTA(TabelKandidat[Nama])",
  };

  /**
   * Tabel kedua yang melakukan validasi apakah
   * akan dilakukan pemilihan putaran selanjutnya
   * atau tidak.
   */
  ws.getCell("E5").value = "Hitungan terbanyak";
  ws.getCell("E6").value = "Hitungan yang duplikat";
  ws.getCell("E7").value = "Tidak mengulang acara";

  ws.getCell("F5").value = {
    formula: "MAX(TabelKandidat[Banyaknya Pemilih])",
  };
  ws.getCell("F6").value = {
    formula:
      "_xlfn.IFNA(INDEX(TabelKandidat[Banyaknya Pemilih],MATCH(1,FIND(TRUE,COUNTIF(TabelKandidat[Banyaknya Pemilih],TabelKandidat[Banyaknya Pemilih])>1),0)),0)",
  };

  ws.getCell("F7").value = {
    formula: 'IF(NOT(F5=F6), "TIDAK MENGULANG", "MENGULANG")',
  };

  ws.addConditionalFormatting({
    ref: "F7",
    rules: conditionalFormatRules(true, "TIDAK MENGULANG", "MENGULANG"),
  });

  /**
   * Tabel ketiga yang melakukan validasi
   * hitungan pada tabel partisipan dan
   * dijabarkan supaya mudah dipahami.
   */
  ws.getCell("B10").value = "Data Awal";
  ws.getCell("C10").value = "JUMLAH";
  ws.getCell("D10").value = "Sama?";
  ws.getCell("E10").value = "JUMLAH";
  ws.getCell("F10").value = "Data Pembanding";

  ws.getCell("B11").value = "Banyak orang yang sudah hadir";
  ws.getCell("B12").value = "Banyak orang yang belum hadir";
  ws.getCell("B13").value = "Banyak orang yang sudah memilih";
  ws.getCell("B14").value = "Banyak orang yang belum memilih";

  ws.getCell("F11").value = "Banyak data waktu hadir";
  ws.getCell("F12").value = "Banyak data waktu belum hadir";
  ws.getCell("F13").value = "Banyak data waktu memilih";
  ws.getCell("F14").value = "Banyak data waktu tidak memilih";

  // Memasukan semua rumus dimulai dari kolom C ke kolom E, lalu di samakan di kolom D.
  ws.getCell("C11").value = {
    formula: 'COUNTIF(TabelPartisipan[Sudah Hadir?], "YA")',
  };
  ws.getCell("C12").value = {
    formula: 'COUNTIF(TabelPartisipan[Sudah Hadir?], "TIDAK")',
  };
  ws.getCell("C13").value = {
    formula: 'COUNTIF(TabelPartisipan[Sudah Memilih?], "YA")',
  };
  ws.getCell("C14").value = {
    formula: 'COUNTIF(TabelPartisipan[Sudah Memilih?], "TIDAK")',
  };

  ws.getCell("E11").value = {
    formula: "COUNTA(TabelPartisipan[Waktu Kehadiran])",
  };
  ws.getCell("E12").value = {
    formula: "COUNTBLANK(TabelPartisipan[Waktu Kehadiran])",
  };
  ws.getCell("E13").value = {
    formula: "COUNTA(TabelPartisipan[Waktu Memilih])",
  };
  ws.getCell("E14").value = {
    formula: "COUNTBLANK(TabelPartisipan[Waktu Memilih])",
  };

  ws.getCell("D11").value = {
    formula: 'IF(C11=E11, "YA", "TIDAK")',
  };
  ws.getCell("D12").value = {
    formula: 'IF(C12=E12, "YA", "TIDAK")',
  };
  ws.getCell("D13").value = {
    formula: 'IF(C13=E13, "YA", "TIDAK")',
  };
  ws.getCell("D14").value = {
    formula: 'IF(C14=E14, "YA", "TIDAK")',
  };

  ws.addConditionalFormatting({
    ref: "D11:D14",
    rules: conditionalFormatRules(),
  });

  /**
   * Tabel terakhir, yang menentukan suara pemilihan sah atau tidak,
   * karena akan melakukan pengecekan apakah suara lebih dari yang diperhitungkan
   */
  ws.getCell("C17").value = "Sigma hitungan kandidat";
  ws.getCell("C18").value = "Status suara sesuai?";

  ws.getCell("D17").value = {
    formula: "SUM(TabelKandidat[Banyaknya Pemilih])",
  };
  ws.getCell("D18").value = {
    formula: '=IF(AND(D17=C13, D17=E13), "YA", "TIDAK")',
  };
  ws.addConditionalFormatting({
    ref: "D18",
    rules: conditionalFormatRules(true),
  });

  ws.getCell("C19").value = "Dimenangkan oleh";
  ws.getCell("D19").value = "Dengan perolehan suara";
  ws.getCell("E19").value = "Dengan durasi pemilihan";

  ws.getCell("C21").value = {
    formula:
      '_xlfn.IF(D18="YA",INDEX(TabelKandidat[Nama],MATCH(F5,TabelKandidat[Banyaknya Pemilih],0)),"---")',
  };
  ws.getCell("D21").value = {
    formula: '_xlfn.IF(D18="YA",CONCAT(F5," Suara"),"---")',
  };
  ws.getCell("E21").value = {
    formula:
      '_xlfn.IF(D18="YA",MAX(FILTER(TabelPartisipan[Waktu Memilih],TabelPartisipan[Waktu Memilih]<>""))-MIN(FILTER(TabelPartisipan[Waktu Kehadiran],TabelPartisipan[Waktu Kehadiran]<>"")),"---")',
  };
  ws.getCell("E21").numFmt = "dd:hh:mm:ss";

  ws.getCell("C22").value = "Status suara";
  ws.getCell("D22").value = {
    formula:
      'IF(AND(D11="YA",D12="YA",D13="YA",D14="YA",D18="YA",D17<=C6),IF(F7="TIDAK MENGULANG","SUARA SAH","SAH DENGAN RONDE SELANJUTNYA"),"SUARA TIDAK SAH")',
  };

  ws.addConditionalFormatting({
    ref: "D22",
    rules: [
      ...conditionalFormatRules(false, "SUARA SAH", "SUARA TIDAK SAH"),
      {
        type: "containsText",
        operator: "containsText",
        priority: 1,
        text: "SAH DENGAN RONDE SELANJUTNYA",
        style: {
          font: {
            color: { argb: "9E6500" },
          },
          fill: {
            type: "pattern",
            pattern: "solid",
            bgColor: { argb: "FFEB9C" },
          },
        },
      },
    ],
  });
}

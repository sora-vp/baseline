import { useState } from "react";
import ExcelJS from "exceljs";
import { FileJson, FileSpreadsheet } from "lucide-react";

import { Button } from "@sora-vp/ui/button";
import { toast } from "@sora-vp/ui/toast";

import { api } from "~/trpc/react";

export function ExportJSON() {
  const exportJson = api.participant.exportJsonData.useMutation({
    onSuccess({ data }) {
      toast.success("Berhasil mengunduh data json!", {
        description: "Silahkan simpan dan gunakan untuk website penyebar QR.",
      });

      const element = document.createElement("a");

      element.setAttribute(
        "href",
        "data:application/json;charset=utf-8," + encodeURIComponent(data),
      );
      element.setAttribute("download", "data-partisipan.json");

      element.click();
    },
    onError(result) {
      toast.error("Gagal mengunduh data excel, coba lagi nanti.", {
        description: result.message,
      });
    },
  });

  return (
    <Button onClick={() => exportJson.mutate()} disabled={exportJson.isPending}>
      Ekspor JSON
      <FileJson className="ml-2 h-4 w-4 lg:ml-6" />
    </Button>
  );
}

export function ExportXLSX() {
  const [additionalDisabled, setDisabled] = useState(false);

  const exportXlsx =
    api.participant.exportXlsxForParticipantToRetrieve.useMutation({
      async onSuccess(result) {
        setDisabled(true);

        toast.success("Berhasil mengunduh data excel!", {
          description:
            "Silahkan simpan dan sebarkan untuk seluruh pemilih tetap yang sudah terdaftar!",
        });

        const workbook = new ExcelJS.Workbook();

        workbook.created = new Date();

        // First processed worksheet
        const firstWorksheet = workbook.addWorksheet("SEMUA DPT YANG VALID", {
          views: [{ state: "frozen", ySplit: 1 }],
        });

        const firstWorksheetRowContent = ["Nama", "QR ID", "Bagian Dari"];
        firstWorksheet.addRow(firstWorksheetRowContent);

        const firstWorksheetRow = firstWorksheet.getRow(1);

        for (let i = 1; i <= firstWorksheetRowContent.length; i++) {
          firstWorksheet.getColumn(i).alignment = {
            vertical: "middle",
            horizontal: i > 1 ? "center" : "left",
          };

          firstWorksheetRow.getCell(i).border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        }

        firstWorksheetRow.alignment = {
          vertical: "middle",
          horizontal: "center",
        };
        firstWorksheetRow.font = {
          bold: true,
        };

        result.nonFiltered.forEach((res, idx) => {
          firstWorksheet.addRow([res.name, res.qrId, res.subpart]);

          const currentRow = firstWorksheet.getRow(idx + 2);

          currentRow.getCell(2).font = {
            name: "Courier New",
            bold: true,
          };

          for (let i = 1; i <= firstWorksheetRowContent.length; i++) {
            currentRow.getCell(i).border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
          }
        });

        firstWorksheet.getColumn(1).width = 40;
        firstWorksheet.getColumn(2).width = 27;
        firstWorksheet.getColumn(3).width = 13;
        // End of first processed worksheet

        // Dynamic worksheet
        const headerRow = ["Nama", "QR ID"];

        for (const subresult of result.filteredSubparts) {
          const worksheet = workbook.addWorksheet(subresult.subpart, {
            views: [{ state: "frozen", ySplit: 1 }],
          });

          worksheet.addRow(headerRow);

          const firstRow = worksheet.getRow(1);

          for (let i = 1; i <= headerRow.length; i++) {
            firstRow.getCell(i).alignment = {
              vertical: "middle",
              horizontal: i > 1 ? "center" : "left",
            };

            firstRow.getCell(i).border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
          }

          worksheet.alignment = {
            vertical: "middle",
            horizontal: "center",
          };
          worksheet.font = {
            bold: true,
          };

          subresult.participants.forEach((res, idx) => {
            worksheet.addRow([res.name, res.qrId]);

            const currentRow = worksheet.getRow(idx + 2);

            currentRow.getCell(2).font = {
              name: "Courier New",
              bold: true,
            };

            currentRow.getCell(2).alignment = {
              vertical: "middle",
              horizontal: "center",
            };

            for (let i = 1; i <= headerRow.length; i++) {
              currentRow.getCell(i).border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
              };
            }
          });

          worksheet.getColumn(1).width = 40;
          worksheet.getColumn(2).width = 27;
        }

        const buffer = await workbook.xlsx.writeBuffer();

        const blob = new Blob([buffer]);
        const url = URL.createObjectURL(blob);

        const anchor = document.createElement("a");

        anchor.href = url;
        anchor.download = `${+Date.now()}-Data Seluruh Pemilih Tetap.xlsx`;

        anchor.click();
        anchor.remove();

        setDisabled(false);
      },
      onError(result) {
        toast.error("Gagal mengunduh data json, coba lagi nanti.", {
          description: result.message,
        });

        setDisabled(false);
      },
    });

  return (
    <Button
      onClick={() => exportXlsx.mutate()}
      disabled={exportXlsx.isPending || additionalDisabled}
    >
      Ekspor XLSX
      <FileSpreadsheet className="ml-2 h-4 w-4 lg:ml-6" />
    </Button>
  );
}

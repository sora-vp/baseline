"use client";

import { Fragment, useMemo } from "react";
import ExcelJS from "exceljs";
import { FileBarChart, LoaderPinwheel } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@sora-vp/ui/button";
import { Skeleton } from "@sora-vp/ui/skeleton";
import { toast } from "@sora-vp/ui/toast";

import { api } from "~/trpc/react";
import {
  candidatesWorksheetWorker,
  excelNormalizeTime,
  overviewWorksheetWorker,
  participantWorksheetWorker,
} from "./excel-operations";

export function Graphic() {
  const { theme } = useTheme();

  const graphicalDataQuery = api.statistic.graphicalDataQuery.useQuery(
    undefined,
    {
      refetchInterval: 1500,
      refetchIntervalInBackground: true,
    },
  );

  const excelReportMutation = api.statistic.dataReportMutation.useMutation({
    async onSuccess(data) {
      const workbook = new ExcelJS.Workbook();

      workbook.created = new Date();

      const overviewWorksheet = workbook.addWorksheet(
        "Ringkasan dan Status Pemilihan",
        {
          views: [{ showGridLines: false }],
        },
      );
      const participantsWorksheet = workbook.addWorksheet("Data Partisipan", {
        views: [{ state: "frozen", ySplit: 1 }],
      });

      participantsWorksheet.addTable({
        name: "TabelPartisipan",
        ref: "A1",
        headerRow: true,
        style: {
          showRowStripes: true,
        },
        columns: [
          { name: "Nama" },
          { name: "Bagian Dari" },
          { name: "QRID" },
          { name: "Sudah Hadir?", filterButton: true },
          { name: "Waktu Kehadiran" },
          { name: "Sudah Memilih?", filterButton: true },
          { name: "Waktu Memilih" },
        ],
        rows: data.participants.map((participant) => [
          participant.name,
          participant.subpart,
          participant.qrId,
          participant.alreadyAttended ? "YA" : "TIDAK",
          participant.attendedAt
            ? excelNormalizeTime(participant.attendedAt)
            : null,
          participant.alreadyChoosing ? "YA" : "TIDAK",
          participant.choosingAt
            ? excelNormalizeTime(participant.choosingAt)
            : null,
        ]),
      });

      participantWorksheetWorker(
        participantsWorksheet,
        data.participants.length + 1,
      );

      const candidatesWorksheet = workbook.addWorksheet(
        "Besaran Suara Kandidat",
        {
          views: [{ state: "frozen", ySplit: 1 }],
        },
      );

      candidatesWorksheet.addTable({
        name: "TabelKandidat",
        ref: "A1",
        headerRow: true,
        style: {
          showRowStripes: true,
        },
        columns: [{ name: "Nama" }, { name: "Banyaknya Pemilih" }],
        rows: data.candidates,
      });

      candidatesWorksheetWorker(candidatesWorksheet);

      overviewWorksheetWorker(overviewWorksheet);

      const buffer = await workbook.xlsx.writeBuffer();

      const blob = new Blob([buffer]);
      const url = URL.createObjectURL(blob);

      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = `${+Date.now()}-Rekapitulasi Laporan Hasil Akhir Pemilihan.xlsx`;

      anchor.click();
      anchor.remove();
    },

    onError(result) {
      toast.error("Gagal membuat laporan pemilihan.", {
        description: result.message,
      });
    },
  });

  const percentageData = useMemo(() => {
    if (!graphicalDataQuery.data || graphicalDataQuery.data.length < 1)
      return null;

    const allCounter = graphicalDataQuery.data.map((d) => d.counter);

    const totalCalc = allCounter.reduce((curr, acc) => curr + acc, 0);
    const percentages = allCounter.map((count, idx) => ({
      idx,
      count: count.toLocaleString("id-ID"),
      percentage: `${Math.round((count / totalCalc) * 100)}%`,
    }));

    if (totalCalc === 0) return [];

    return percentages;
  }, [graphicalDataQuery.data]);

  return (
    <>
      {graphicalDataQuery.isLoading ? (
        <Skeleton className="h-[350px] w-full" />
      ) : (
        <>
          {graphicalDataQuery.data && graphicalDataQuery.data.length < 1 ? (
            <div className="flex h-[350px] items-center justify-center">
              <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                N/A
              </h1>
            </div>
          ) : (
            <div className="flex flex-col gap-3 md:flex-row md:gap-0">
              <div className="lg:w-5/6">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={graphicalDataQuery.data ?? []}>
                    <XAxis
                      stroke={theme === "light" ? "#000000" : "#888888"}
                      dataKey="name"
                      fontSize={15}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke={theme === "light" ? "#000000" : "#888888"}
                      fontSize={15}
                    />
                    <Bar
                      dataKey="counter"
                      fill="currentColor"
                      radius={[4, 4, 0, 0]}
                      className="fill-primary"
                    />
                    <Tooltip
                      cursor={{ fill: "none" }}
                      contentStyle={{
                        backgroundColor:
                          theme === "light" ? "#f4f4f5" : "#171923",
                        borderColor: theme === "light" ? "#171923" : "#f4f4f5",
                        borderRadius: "2mm",
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col items-center justify-center gap-5 lg:w-1/6">
                <div className="space-y-2">
                  <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                    Persentase Pemilihan
                  </h4>

                  <p className="text-center leading-7 lg:text-start [&:not(:first-child)]:mt-6">
                    {!percentageData ? (
                      "N/A."
                    ) : percentageData.length < 1 ? (
                      "Belum ada yang memilih."
                    ) : (
                      <>
                        {percentageData.map((data) => (
                          <Fragment key={data.idx}>
                            {data.idx > 0 ? (
                              <>
                                <span className="text-xl"> - </span>
                                <ruby className="text-2xl">
                                  {data.percentage}
                                  <rt>{data.count}</rt>
                                </ruby>
                              </>
                            ) : (
                              <ruby className="text-2xl">
                                {data.percentage}
                                <rt>{data.count}</rt>
                              </ruby>
                            )}
                          </Fragment>
                        ))}
                        {" ."}
                      </>
                    )}
                  </p>
                </div>

                {!percentageData ? null : percentageData.length < 1 ? null : (
                  <Button
                    variant="secondary"
                    className="w-[55%] md:w-[65%] lg:w-[95%]"
                    disabled={excelReportMutation.isPending}
                    onClick={() => excelReportMutation.mutate()}
                  >
                    {excelReportMutation.isPending ? (
                      <LoaderPinwheel className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Unduh Laporan
                    {!excelReportMutation.isPending ? (
                      <FileBarChart className="ml-2 h-4 w-4" />
                    ) : null}
                  </Button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

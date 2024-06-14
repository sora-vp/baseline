"use client";

import { FileBarChart } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@sora-vp/ui/button";
import { Skeleton } from "@sora-vp/ui/skeleton";

import { api } from "~/trpc/react";

export function Graphic() {
  const { theme } = useTheme();

  const graphicalDataQuery = api.statistic.graphicalDataQuery.useQuery(
    undefined,
    {
      refetchInterval: 1500,
      refetchIntervalInBackground: true,
    },
  );

  return (
    <>
      {graphicalDataQuery.isLoading ? (
        <Skeleton className="h-[350px] w-full" />
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
                <Legend />
                <Bar
                  dataKey="counter"
                  fill="currentColor"
                  radius={[4, 4, 0, 0]}
                  className="fill-primary"
                />
                <Tooltip
                  cursor={{ fill: "none" }}
                  contentStyle={{
                    backgroundColor: theme === "light" ? "#f4f4f5" : "#171923",
                    borderColor: theme === "light" ? "#171923" : "#f4f4f5",
                    borderRadius: "2mm",
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center lg:w-1/6">
            <Button variant="secondary">
              Unduh Data Laporan
              <FileBarChart className="ml-3 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

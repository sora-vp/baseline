"use client";

import { cn } from "@sora-vp/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@sora-vp/ui/card";
import { Skeleton } from "@sora-vp/ui/skeleton";

import { api } from "~/trpc/react";

export default function Essential() {
  const essentialQuery = api.statistic.essentialInfoQuery.useQuery(undefined, {
    refetchInterval: 1500,
    refetchIntervalInBackground: true,
  });

  return (
    <>
      {essentialQuery.isLoading ? (
        <>
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </>
      ) : (
        <>
          <CandidateAccumulation count={essentialQuery.data.candidates} />
          <ParticipantAccumulation count={essentialQuery.data.participants} />
          <IsDataMatch isMatch={essentialQuery.data.isMatch} />
        </>
      )}
    </>
  );
}

function CandidateAccumulation(props: { count: number | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="scroll-m-20 text-center text-2xl font-semibold tracking-tight">
          Akumulasi Kandidat
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          {props.count ? (
            <h4 className="scroll-m-20 text-xl tracking-tight">
              {props.count.toLocaleString()} Orang
            </h4>
          ) : (
            <>
              <h2 className="scroll-m-20 text-3xl font-bold tracking-tight first:mt-0">
                N/A
              </h2>
              <p className="dark:font-extralight">Belum di setup.</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ParticipantAccumulation(props: { count: number | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="scroll-m-20 text-center text-2xl font-semibold tracking-tight">
          Akumulasi Pemilih
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          {props.count ? (
            <h4 className="scroll-m-20 text-xl tracking-tight">
              {props.count.toLocaleString()} Orang
            </h4>
          ) : (
            <>
              <h2 className="scroll-m-20 text-3xl font-bold tracking-tight first:mt-0">
                N/A
              </h2>
              <p className="dark:font-extralight">Belum di setup.</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function IsDataMatch(props: { isMatch: boolean | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="scroll-m-20 text-center text-2xl font-semibold tracking-tight">
          Kecocokan Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          {props.isMatch !== null ? (
            <h4
              className={cn(
                "scroll-m-20 rounded px-2 text-xl font-semibold tracking-tight",
                props.isMatch
                  ? "bg-green-400 dark:bg-green-800"
                  : "bg-red-400 dark:bg-red-800",
              )}
            >
              {props.isMatch ? "COCOK!" : "TIDAK COCOK!"}
            </h4>
          ) : (
            <>
              <h2 className="scroll-m-20 text-3xl font-bold tracking-tight first:mt-0">
                N/A
              </h2>
              <p className="dark:font-extralight">Belum di setup.</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

import type { TRPCRouterRecord } from "@trpc/server";

import {
  preparedGetAttendedAndVoted,
  preparedGetCandidateCountsOnly,
  preparedGetGraphicalData,
} from "@sora-vp/db";

import { adminProcedure } from "../trpc";

export const statisticRouter = {
  graphicalDataQuery: adminProcedure.query(() =>
    preparedGetGraphicalData.execute(),
  ),

  essentialInfoQuery: adminProcedure.query(async () => {
    const candidates = await preparedGetCandidateCountsOnly.execute();

    if (!candidates || candidates.length < 1)
      return {
        isMatch: null,
        participants: null,
        candidates: null,
      };

    const participantCounter = await preparedGetAttendedAndVoted.execute();
    const extractCount = participantCounter.at(0)!;
    const participantsAccumulation = extractCount.count;

    const candidatesAccumulation = candidates
      .map((d) => d.counter)
      .reduce((curr, acc) => curr + acc);

    return {
      isMatch: participantsAccumulation === candidatesAccumulation,
      participants: participantsAccumulation,
      candidates: candidatesAccumulation,
    };
  }),

  dataReportMutation: adminProcedure.mutation(async ({ ctx }) => {
    return {
      success: true,
    };
  }),
} satisfies TRPCRouterRecord;

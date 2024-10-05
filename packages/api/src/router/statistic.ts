import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";

import {
  preparedGetAllParticipants,
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

    if (candidates.length < 1)
      return {
        isMatch: null,
        participants: null,
        candidates: null,
      };

    const participantCounter = await preparedGetAttendedAndVoted.execute();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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

  dataReportMutation: adminProcedure.mutation(async () => {
    const candidates = await preparedGetGraphicalData.execute();
    const participants = await preparedGetAllParticipants.execute();

    if (candidates.length < 0)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tidak ada data kandidat!",
      });

    if (participants.length < 0)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tidak ada data peserta pemilihan!",
      });

    return {
      participants,
      candidates: candidates.map((c) => [c.name, c.counter]),
    };
  }),
} satisfies TRPCRouterRecord;

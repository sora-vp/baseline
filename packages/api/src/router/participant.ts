import type { TRPCRouterRecord } from "@trpc/server";

import { preparedGetAllParticipants, schema } from "@sora-vp/db";
import { participant } from "@sora-vp/validators";

import { protectedProcedure } from "../trpc";

export const participantRouter = {
  getAllParticipants: protectedProcedure.query(() =>
    preparedGetAllParticipants.execute(),
  ),

  createNewParticipant: protectedProcedure
    .input(participant.SharedAddPariticipant)
    .mutation(({ ctx, input }) =>
      ctx.db.transaction((tx) => tx.insert(schema.participants).values(input)),
    ),
} satisfies TRPCRouterRecord;

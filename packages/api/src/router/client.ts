import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";

import { and, eq, not, schema, sql } from "@sora-vp/db";
import settings from "@sora-vp/settings";
import { participant } from "@sora-vp/validators";

import { publicProcedure } from "../trpc";

export const clientRouter = {
  settings: publicProcedure.query(() => {
    const { canLogin: _, ...rest } = settings.getSettings();

    return rest;
  }),

  participantAttend: publicProcedure
    .input(participant.ParticipantAttendSchema)
    .mutation(async ({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        const participant = await tx.execute(sql`
          SELECT * FROM ${schema.participants} WHERE ${schema.participants.qrId} = ${input} FOR UPDATE
        `);

        console.log(participant);
      }),
    ),
} satisfies TRPCRouterRecord;

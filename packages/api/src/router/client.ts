import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";

import { eq, schema, sql } from "@sora-vp/db";
import settings, { canAttendNow } from "@sora-vp/settings";
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
        if (!canAttendNow())
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Belum diperbolehkan untuk melakukan absensi!",
          });

        const participantRawQuery = await tx.execute(sql`
          SELECT * FROM ${schema.participants} WHERE ${schema.participants.qrId} = ${input} FOR UPDATE
        `);

        const participantContainer = participantRawQuery.at(0) as unknown as {
          name: string;
          already_attended: boolean;
          qr_id: string;
          sub_part: string;
        }[];

        const participant = participantContainer.at(0);

        if (!participant)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Peserta pemilihan tidak dapat ditemukan!",
          });

        if (participant.already_attended)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Kamu sudah absen!",
          });

        await tx
          .update(schema.participants)
          .set({
            alreadyAttended: true,
            attendedAt: new Date(),
          })
          .where(eq(schema.participants.qrId, input));

        return {
          name: participant.name,
          qrId: participant.qr_id,
          subpart: participant.sub_part,
        };
      }),
    ),
} satisfies TRPCRouterRecord;

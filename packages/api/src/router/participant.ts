import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";

import {
  eq,
  preparedGetAllParticipants,
  preparedGetExcelParticipants,
  schema,
} from "@sora-vp/db";
import { participant } from "@sora-vp/validators";

import { protectedProcedure } from "../trpc";

export const participantRouter = {
  getAllParticipants: protectedProcedure.query(() =>
    preparedGetAllParticipants.execute(),
  ),

  createNewParticipant: protectedProcedure
    .input(participant.SharedAddParticipant)
    .mutation(({ ctx, input }) =>
      ctx.db.transaction((tx) => tx.insert(schema.participants).values(input)),
    ),

  insertManyParticipant: protectedProcedure
    .input(participant.SharedUploadManyParticipant)
    .mutation(({ input, ctx }) =>
      ctx.db.transaction(async (tx) => {
        const okToInsert = input.map((data) => ({
          name: data.Nama,
          subpart: data["Bagian Dari"],
        }));

        const checkThing = await Promise.all(
          okToInsert.map(({ name }) =>
            tx.query.participants.findFirst({
              where: eq(schema.participants.name, name),
            }),
          ),
        );
        const normalizedCheckThing = checkThing.filter((d) => !!d);

        if (
          normalizedCheckThing.length > 0 &&
          normalizedCheckThing.every((data) => data !== null)
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Semua data yang ingin di upload sudah terdaftar!",
          });
        }

        if (
          normalizedCheckThing.length > 0 &&
          normalizedCheckThing.some((data) => data !== null)
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Beberapa data yang ingin di upload sudah ada!",
          });
        }

        return tx.insert(schema.participants).values(okToInsert);
      }),
    ),

  updateParticipant: protectedProcedure
    .input(participant.ServerUpdateParticipant)
    .mutation(({ input, ctx }) =>
      ctx.db.transaction(async (tx) => {
        const participant = await tx.query.participants.findFirst({
          where: eq(schema.participants.qrId, input.qrId),
        });

        if (!participant)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Peserta pemilihan tidak dapat ditemukan!",
          });

        return await tx
          .update(schema.participants)
          .set({
            name: input.name,
            subpart: input.subpart,
          })
          .where(eq(schema.participants.qrId, input.qrId));
      }),
    ),

  deleteParticipant: protectedProcedure
    .input(participant.ServerDeleteParticipant)
    .mutation(({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        // if (canAttendNow())
        //     throw new TRPCError({
        //       code: "UNAUTHORIZED",
        //       message:
        //         "Tidak di izinkan untuk menghapus peserta karena masih dalam masa diperbolehkan absen!",
        //     });

        const participant = await tx.query.participants.findFirst({
          where: eq(schema.participants.qrId, input.qrId),
        });

        if (!participant)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Peserta pemilihan tidak dapat ditemukan!",
          });

        if (participant.alreadyAttended)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Peserta pemilihan sebelumnya sudah absen!",
          });

        if (participant.alreadyChoosing)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Peserta pemilihan sebelumnya sudah memilih!",
          });

        return await tx
          .delete(schema.participants)
          .where(eq(schema.participants.qrId, input.qrId));
      }),
    ),

  exportJsonData: protectedProcedure.mutation(async () => {
    const participants = await preparedGetExcelParticipants.execute();

    if (!participants || participants.length < 0)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tidak ada data peserta pemilihan!",
      });

    return { data: JSON.stringify(participants, null, 2) };
  }),

  exportXlsxForParticipantToRetrieve: protectedProcedure.mutation(async () => {
    const participants = await preparedGetExcelParticipants.execute();

    if (!participants || participants.length < 1)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tidak ada data peserta pemilihan!",
      });

    const resorted = participants.sort((a, b) => {
      if (a.subpart === b.subpart) return a.name.localeCompare(b.name);

      return a.subpart.localeCompare(b.subpart);
    });

    const filteredSubparts = [...new Set(resorted.map((d) => d.subpart))].map(
      (subpart) => ({
        subpart,
        participants: resorted
          .filter((r) => r.subpart === subpart)
          .map(({ subpart: _, ...rest }) => rest),
      }),
    );

    return {
      nonFiltered: resorted,
      filteredSubparts,
    };
  }),
} satisfies TRPCRouterRecord;

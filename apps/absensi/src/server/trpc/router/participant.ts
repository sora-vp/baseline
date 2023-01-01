import { router, protectedProcedure, publicProcedure } from "../trpc";

import { ParticipantModel } from "@models/index";
import {
  PaginatedParticipantValidationSchema,
  ParticipantAttendValidationSchema,
  TambahPesertaValidationSchema,
} from "@schema/admin.peserta.schema";
import { TRPCError } from "@trpc/server";

export const participantRouter = router({
  getParticipantPaginated: protectedProcedure
    .input(PaginatedParticipantValidationSchema)
    .query(
      async ({ input: { pageSize: limit, pageIndex: offset } }) =>
        await ParticipantModel.paginate({}, { offset, limit }).catch(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (e: any) => {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: e.message,
            });
          }
        )
    ),

  createNewParticipant: protectedProcedure
    .input(TambahPesertaValidationSchema)
    .mutation(async ({ input }) => {
      const newParticipant = new ParticipantModel(input);

      await newParticipant.save();

      return { message: "Berhasil menambahkan peserta baru!" };
    }),

  participantAttend: publicProcedure
    .input(ParticipantAttendValidationSchema)
    .mutation(async ({ input }) => {
      const participant = await ParticipantModel.findOne({ qrId: input });

      if (!participant)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Peserta pemilihan tidak dapat ditemukan!",
        });

      if (participant.sudahAbsen)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kamu sudah absen!",
        });

      participant.sudahAbsen = true;
      await participant.save();

      return { message: "Berhasil melakukan absensi!" };
    }),
});

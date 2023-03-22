import { router, protectedProcedure, publicProcedure } from "../trpc";

import { ParticipantModel } from "@models/index";
import {
  PaginatedParticipantValidationSchema,
  TambahPesertaManyValidationSchema,
  ParticipantAttendValidationSchema,
  TambahPesertaValidationSchema,
  DeletePesertaValidationSchema,
} from "@schema/admin.participant.schema";
import { TRPCError } from "@trpc/server";

import { runInTransaction } from "@utils/transaction";

export const participantRouter = router({
  getParticipantPaginated: protectedProcedure
    .input(PaginatedParticipantValidationSchema)
    .query(
      async ({ input: { pageSize: limit, pageIndex: offset } }) =>
        await ParticipantModel.paginate({}, { offset, limit }).catch(
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

  insertManyParticipant: protectedProcedure
    .input(TambahPesertaManyValidationSchema)
    .mutation(async ({ input }) => {
      const okToInsert = input.map(({ Nama }) => ({ nama: Nama }));

      const checkThing = await Promise.all(
        okToInsert.map(({ nama }) => ParticipantModel.findOne({ nama }))
      );

      if (checkThing.every((data) => data !== null)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Semua data dengan nama yang sama, semuanya sudah di upload!",
        });
      }

      if (checkThing.some((data) => data !== null)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Beberapa data yang di upload sudah ada!",
        });
      }

      await ParticipantModel.insertMany(okToInsert);

      return { message: "Berhasil mengupload data file csv!" };
    }),

  deleteParticipant: protectedProcedure
    .input(DeletePesertaValidationSchema)
    .mutation(async ({ input }) => {
      const participant = await ParticipantModel.findById(input.id);

      if (!participant)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Peserta pemilihan tidak dapat ditemukan!",
        });

      await participant.deleteOne();

      return { message: "Berhasil menghapus peserta!" };
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

  isParticipantAlreadyAttended: publicProcedure
    .input(ParticipantAttendValidationSchema)
    .mutation(async ({ input }) => {
      const participant = await ParticipantModel.findOne({ qrId: input });

      if (!participant)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Peserta pemilihan tidak dapat ditemukan!",
        });

      if (participant.sudahMemilih)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kamu sudah memilih kandidat!",
        });

      if (!participant.sudahAbsen)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kamu belum absen!",
        });

      return { success: true };
    }),

  getParticipantStatus: publicProcedure
    .input(ParticipantAttendValidationSchema)
    .query(async ({ input }) => {
      const participant = await ParticipantModel.findOne({ qrId: input });

      if (!participant)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Peserta pemilihan tidak dapat ditemukan!",
        });

      return {
        sudahAbsen: participant.sudahAbsen,
        sudahMemilih: participant.sudahMemilih,
      };
    }),
});

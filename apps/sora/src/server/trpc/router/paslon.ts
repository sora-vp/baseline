import { TRPCError } from "@trpc/server";

import {
  router,
  publicProcedure,
  protectedProcedure,
  unprotectedProcedure,
} from "../trpc";

import { PaslonModel, Paslon as PaslonType } from "@models/index";
import {
  upvoteValidationSchema,
  adminDeleteCandidateValidationSchema,
  adminGetSpecificCandidateValidationSchema,
} from "@schema/admin.paslon.schema";

import { canVoteNow } from "@utils/canVote";

import { trpcAbsensi } from "@utils/trpc";

export const paslonRouter = router({
  candidateList: publicProcedure.query(async () => {
    const data = await PaslonModel.find({}).lean();

    return data.map((kandidat: PaslonType & { _id: string }) => ({
      id: kandidat._id,
      namaKetua: kandidat.namaKetua,
      namaWakil: kandidat.namaWakil,
      imgName: kandidat.imgName,
    }));
  }),

  adminCandidateList: protectedProcedure.query(
    async () => await PaslonModel.find({}).lean()
  ),

  getSpecificCandidate: protectedProcedure
    .input(adminGetSpecificCandidateValidationSchema)
    .query(async ({ input }) => {
      const paslon = await PaslonModel.findById(input.id);

      if (!paslon)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Paslon tidak dapat ditemukan!",
        });

      // For the easiest reset for frontend
      return {
        ketua: paslon.namaKetua,
        wakil: paslon.namaWakil,
      };
    }),

  adminDeleteCandidate: protectedProcedure
    .input(adminDeleteCandidateValidationSchema)
    .mutation(async ({ input }) => {
      const inVotingCondition = await canVoteNow(input.timeZone);

      if (inVotingCondition)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tidak bisa menghapus paslon dalam kondisi pemilihan!",
        });

      const isPaslonExist = await PaslonModel.findById(input.id);

      if (!isPaslonExist)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Paslon tidak dapat ditemukan!",
        });

      await PaslonModel.findByIdAndRemove(input.id);

      return { message: "Berhasil menghapus paslon!" };
    }),

  upvote: unprotectedProcedure
    .input(upvoteValidationSchema)
    .mutation(async ({ input }) => {
      const inVotingCondition = await canVoteNow(input.timeZone);

      if (!inVotingCondition)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Tidak bisa memilih paslon jika bukan dalam kondisi pemilihan!",
        });

      try {
        const participantStatus =
          await trpcAbsensi.participant.getParticipantStatus.query(input.qrId);

        if (participantStatus.sudahMemilih)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Kamu sudah memilih!",
          });

        if (!participantStatus.sudahAbsen)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Kamu belum absen!",
          });

        const isPaslonExist = await PaslonModel.findById(input.id);

        if (!isPaslonExist)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Paslon tidak dapat ditemukan!",
          });

        try {
          const upvoteStatus =
            await trpcAbsensi.participant.updateUserUpvoteStatus.mutate(
              input.qrId
            );

          if (!upvoteStatus.success)
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message:
                "Gagal pada saat memilih kandidat! Mohon untuk dicoba lagi!",
            });

          await PaslonModel.findByIdAndUpdate(input.id, {
            $inc: { dipilih: 1 },
          });

          return { message: "Berhasil memilih paslon!" };
        } catch (e: any) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "Tidak dapat memilih, telah terjadi kesalahan internal saat memilih!",
          });
        }
      } catch (e: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Terjadi kesalahan internal!",
        });
      }
    }),
});

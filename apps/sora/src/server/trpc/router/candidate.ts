import { TRPCError } from "@trpc/server";

import {
  router,
  publicProcedure,
  protectedProcedure,
  unprotectedProcedure,
} from "../trpc";

import { KandidatModel } from "@models/index";
import {
  upvoteValidationSchema,
  adminDeleteCandidateValidationSchema,
  adminGetSpecificCandidateValidationSchema,
} from "@schema/admin.paslon.schema";

import { canVoteNow } from "@utils/canVote";

import { trpcAbsensi } from "@utils/trpc";

export const candidateRouter = router({
  candidateList: publicProcedure.query(async () => {
    const data = await KandidatModel.find({}).lean();

    return data.map((kandidat) => ({
      id: kandidat._id,
      namaKandidat: kandidat.namaKandidat,
      imgName: kandidat.imgName,
    }));
  }),

  adminCandidateList: protectedProcedure.query(
    async () => await KandidatModel.find({}).lean()
  ),

  getSpecificCandidate: protectedProcedure
    .input(adminGetSpecificCandidateValidationSchema)
    .query(async ({ input }) => {
      const kandidat = await KandidatModel.findById(input.id);

      if (!kandidat)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kandidat tidak dapat ditemukan!",
        });

      // For the easiest reset for frontend
      return {
        kandidat: kandidat.namaKandidat,
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

      const isPaslonExist = await KandidatModel.findById(input.id);

      if (!isPaslonExist)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Paslon tidak dapat ditemukan!",
        });

      await KandidatModel.findByIdAndRemove(input.id);

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

        const isPaslonExist = await KandidatModel.findById(input.id);

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

          await KandidatModel.findByIdAndUpdate(input.id, {
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

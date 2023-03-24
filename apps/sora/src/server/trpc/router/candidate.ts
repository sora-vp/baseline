import { TRPCError } from "@trpc/server";

import {
  router,
  publicProcedure,
  protectedProcedure,
  unprotectedProcedure,
} from "../trpc";

import { KandidatModel } from "../../../models";
import {
  upvoteValidationSchema,
  adminDeleteCandidateValidationSchema,
  adminGetSpecificCandidateValidationSchema,
} from "../../../schema/admin.candidate.schema";

import { canVoteNow } from "../../../utils/canDoSomething";

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
      const inVotingCondition = await canVoteNow();

      if (inVotingCondition)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tidak bisa menghapus kandidat dalam kondisi pemilihan!",
        });

      const isCandidateExist = await KandidatModel.findById(input.id);

      if (!isCandidateExist)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kandidat tidak dapat ditemukan!",
        });

      await KandidatModel.findByIdAndRemove(input.id);

      return { message: "Berhasil menghapus kandidat!" };
    }),

  upvote: unprotectedProcedure
    .input(upvoteValidationSchema)
    .mutation(async ({ input }) => {
      const inVotingCondition = await canVoteNow();

      if (!inVotingCondition)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Tidak bisa memilih kandidat jika bukan dalam kondisi pemilihan!",
        });

      try {
        // const participantStatus =
        //   await trpcAbsensi.participant.getParticipantStatus.query(input.qrId);

        // if (participantStatus.sudahMemilih)
        //   throw new TRPCError({
        //     code: "BAD_REQUEST",
        //     message: "Kamu sudah memilih!",
        // });

        // if (!participantStatus.sudahAbsen)
        //   throw new TRPCError({
        //     code: "BAD_REQUEST",
        //     message: "Kamu belum absen!",
        //   });

        const isCandidateExist = await KandidatModel.findById(input.id);

        if (!isCandidateExist)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Kandidat tidak dapat ditemukan!",
          });

        try {
          // const upvoteStatus =
          //   await trpcAbsensi.participant.updateUserUpvoteStatus.mutate(
          //     input.qrId
          //   );

          // if (!upvoteStatus.success)
          //   throw new TRPCError({
          //     code: "INTERNAL_SERVER_ERROR",
          //     message:
          //       "Gagal pada saat memilih kandidat! Mohon untuk dicoba lagi!",
          //   });

          await KandidatModel.findByIdAndUpdate(input.id, {
            $inc: { dipilih: 1 },
          });

          return { message: "Berhasil memilih kandidat!" };
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

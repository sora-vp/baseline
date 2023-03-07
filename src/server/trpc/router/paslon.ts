import { TRPCError } from "@trpc/server";

import {
  router,
  publicProcedure,
  protectedProcedure,
  unprotectedProcedure,
} from "../trpc";

import { KandidatModel, Kandidat as KandidatType } from "../../../models";
import {
  adminDeleteCandidateAndUpvoteValidationSchema,
  adminGetSpecificCandidateValidationSchema,
} from "../../../schema/admin.paslon.schema";

import { canVoteNow } from "../../../utils/canVote";

export const paslonRouter = router({
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
    .input(adminDeleteCandidateAndUpvoteValidationSchema)
    .mutation(async ({ input }) => {
      const inVotingCondition = await canVoteNow(input.timeZone);

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
    .input(adminDeleteCandidateAndUpvoteValidationSchema)
    .mutation(async ({ input }) => {
      const inVotingCondition = await canVoteNow(input.timeZone);

      if (!inVotingCondition)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Tidak bisa memilih kandidat jika bukan dalam kondisi pemilihan!",
        });

      const isCandidateExist = await KandidatModel.findById(input.id);

      if (!isCandidateExist)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kandidat tidak dapat ditemukan!",
        });

      await KandidatModel.findByIdAndUpdate(input.id, {
        $inc: { dipilih: 1 },
      });

      return { message: "Berhasil memilih kandidat!" };
    }),
});

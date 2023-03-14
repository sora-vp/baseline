import { TRPCError } from "@trpc/server";

import {
  router,
  publicProcedure,
  protectedProcedure,
  unprotectedProcedure,
} from "../trpc";

import { KandidatModel, KandidatBackupModel } from "../../../models";
import {
  adminDeleteCandidateAndUpvoteValidationSchema,
  adminGetSpecificCandidateValidationSchema,
} from "../../../schema/admin.candidate.schema";

import { canVoteNow } from "../../../utils/canVote";

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

      // OKAY TO GIVE AN ERROR MESSAGE, THIS IS FAILSAFE SYSTEM
      // MAKE SURE TO CHECK YOUR FAILSAFE BACKUP ON
      try {
        const isCandidateBackupExist = await KandidatBackupModel.findById(
          input.id
        );

        if (isCandidateBackupExist)
          await KandidatBackupModel.findByIdAndRemove(input.id);
      } catch (e) {
        console.log(
          `DB (SLAVE): ERROR ATTEMPT TO REMOVE A CANDIDATE BACKUP AND PLEASE REMOVE IT MANUALLY (IF EXIST), _id: ${input.id}, ${e}`
        );
      }

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

      const baseDate = new Date();

      const updatedData = await KandidatModel.findByIdAndUpdate(input.id, {
        $inc: { dipilih: 1 },
        $set: { last_voted_at: baseDate },
      }).lean();

      // OKAY TO GIVE AN ERROR MESSAGE, THIS IS FAILSAFE SYSTEM
      // MAKE SURE TO CHECK YOUR FAILSAFE BACKUP ON
      try {
        await KandidatBackupModel.findByIdAndUpdate(
          updatedData!._id,
          {
            namaKandidat: updatedData!.namaKandidat,
            imgName: updatedData!.imgName,
            dipilih: updatedData!.dipilih + 1,
            last_voted_at: baseDate,
          },
          { upsert: true }
        );
      } catch (e) {
        console.log(`DB (SLAVE): ERROR TO UPDATE AN UPVOTE BACKUP, ${e}`);
      }

      return { message: "Berhasil memilih kandidat!" };
    }),
});

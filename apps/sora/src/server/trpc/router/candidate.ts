import { TRPCError } from "@trpc/server";

import {
  router,
  publicProcedure,
  protectedProcedure,
  unprotectedProcedure,
} from "../trpc";

import { ParticipantModel, KandidatModel } from "../../../models";
import {
  upvoteValidationSchema,
  adminDeleteCandidateValidationSchema,
  adminGetSpecificCandidateValidationSchema,
} from "../../../schema/admin.candidate.schema";

import { canVoteNow } from "../../../utils/canDoSomething";
import { runInTransaction } from "../../../utils/transaction";

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

      const candidate = await KandidatModel.findById(input.id);

      if (!candidate)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kandidat tidak dapat ditemukan!",
        });

      if (candidate.dipilih > 0)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Tidak bisa menghapus kandidat dikarenakan sudah ada yang memilihnya!",
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

      const participant = await ParticipantModel.findOne({ qrId: input.qrId });

      if (!participant)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kamu belum terdaftar dalam daftar peserta pemilihan!",
        });

      if (participant.sudahMemilih)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kamu sudah memilih!",
        });

      if (!participant.sudahAbsen)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kamu belum absen!",
        });

      const isCandidateExist = await KandidatModel.findById(input.id);

      if (!isCandidateExist)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kandidat tidak dapat ditemukan!",
        });

      await runInTransaction(async (session) => {
        await participant.updateOne(
          { $set: { sudahMemilih: true } },
          { session }
        );

        await KandidatModel.findByIdAndUpdate(
          input.id,
          {
            $inc: { dipilih: 1 },
          },
          { session }
        );
      });

      return { message: "Berhasil memilih kandidat!" };
    }),
});

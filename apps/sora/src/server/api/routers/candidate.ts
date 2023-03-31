import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  unprotectedProcedure,
} from "~/server/api/trpc";

import { prisma } from "~/server/db";
import {
  upvoteValidationSchema,
  adminDeleteCandidateValidationSchema,
  adminGetSpecificCandidateValidationSchema,
} from "~/schema/admin.candidate.schema";

import { canVoteNow } from "~/utils/canDoSomething";

export const candidateRouter = createTRPCRouter({
  candidateList: publicProcedure.query(async () => {
    const data = await prisma.candidate.findMany();

    return data.map((kandidat) => ({
      id: kandidat.id,
      name: kandidat.name,
      image: kandidat.img,
    }));
  }),

  adminCandidateList: protectedProcedure.query(() =>
    prisma.candidate.findMany()
  ),

  getSpecificCandidate: protectedProcedure
    .input(adminGetSpecificCandidateValidationSchema)
    .query(async ({ input }) => {
      const kandidat = await prisma.candidate.findUnique({
        where: { id: input.id },
      });

      if (!kandidat)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kandidat tidak dapat ditemukan!",
        });

      // For the easiest reset for frontend
      return {
        kandidat: kandidat.name,
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

      const candidate = await prisma.candidate.findUnique({
        where: { id: input.id },
      });

      if (!candidate)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kandidat tidak dapat ditemukan!",
        });

      if (candidate.counter > 0)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Tidak bisa menghapus kandidat dikarenakan sudah ada yang memilihnya!",
        });

      await prisma.candidate.delete({ where: { id: input.id } });

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

      const participant = await prisma.participant.findUnique({
        where: { qrId: input.qrId },
      });

      if (!participant)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kamu belum terdaftar dalam daftar peserta pemilihan!",
        });

      if (participant.alreadyChoosing)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kamu sudah memilih!",
        });

      if (!participant.alreadyAttended)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kamu belum absen!",
        });

      const isCandidateExist = await prisma.candidate.findUnique({
        where: { id: input.id },
      });

      if (!isCandidateExist)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kandidat tidak dapat ditemukan!",
        });

      await prisma.$transaction([
        prisma.participant.update({
          where: { qrId: input.qrId },
          data: {
            alreadyChoosing: true,
            choosingAt: new Date(),
          },
        }),
        prisma.candidate.update({
          where: { id: input.id },
          data: {
            counter: {
              increment: 1,
            },
          },
        }),
      ]);

      return { message: "Berhasil memilih kandidat!" };
    }),
});

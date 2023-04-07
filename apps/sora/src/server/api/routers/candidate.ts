import { TRPCError } from "@trpc/server";
import amqp from "amqplib";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  unprotectedProcedure,
} from "~/server/api/trpc";
import { env } from "~/env.mjs";

import { prisma } from "~/server/db";
import {
  upvoteValidationSchema,
  adminDeleteCandidateValidationSchema,
  adminGetSpecificCandidateValidationSchema,
} from "~/schema/admin.candidate.schema";

import { canVoteNow } from "~/utils/canDoSomething";

const QUEUE_NAME = "vote_queue";

export const candidateRouter = createTRPCRouter({
  candidateList: publicProcedure.query(() =>
    prisma.candidate.findMany({
      select: {
        id: true,
        name: true,
        img: true,
      },
    })
  ),

  statisticList: protectedProcedure.query(() =>
    prisma.candidate.findMany({ select: { name: true, counter: true } })
  ),

  adminCandidateList: protectedProcedure.query(() =>
    prisma.candidate.findMany()
  ),

  getCandidateAndParticipantCount: protectedProcedure.query(async () => {
    const candidates = await prisma.candidate.findMany({
      select: {
        counter: true,
      },
      where: {
        counter: {
          gt: 0,
        },
      },
    });

    const alreadyAttendedAndChoosing = await prisma.participant.count({
      where: {
        alreadyAttended: true,
        alreadyChoosing: true,
      },
    });

    if (!candidates)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Belum ada kandidat yang terdaftar",
      });

    const candidatesAccumulation = candidates
      .map(({ counter }) => counter)
      .reduce((curr, acc) => curr + acc);

    return {
      isMatch: candidatesAccumulation === alreadyAttendedAndChoosing,
      participants: alreadyAttendedAndChoosing,
      candidates: candidatesAccumulation,
    };
  }),

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

      const isCandidateExist = await prisma.candidate.findUnique({
        where: { id: input.id },
      });

      if (!isCandidateExist)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kandidat tidak dapat ditemukan!",
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

      const connection = await amqp.connect(env.DATABASE_URL);

      try {
        const messageFromQueue = (await new Promise(async (resolve, reject) => {
          const channel = await connection.createChannel();

          const { queue } = await channel.assertQueue(QUEUE_NAME, {
            durable: false,
          });

          const payload = JSON.stringify(input);

          const response = await channel.assertQueue("");
          const correlationId = response.queue;

          await channel.consume(correlationId, (msg) => {
            if (!msg) {
              reject(
                "Publisher has been cancelled or channel has been closed."
              );
              return;
            }

            if (msg.properties.correlationId === correlationId) {
              resolve(JSON.parse(msg.content.toString()));
              channel.ack(msg);
            }
          });

          channel.sendToQueue(queue, Buffer.from(payload), {
            correlationId,
            replyTo: correlationId,
          });
        })) as { success: boolean; message?: string };

        if (!messageFromQueue.success)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: messageFromQueue.message as string,
          });

        return { message: "Berhasil memilih kandidat!" };
      } finally {
        connection.close();
      }
    }),
});

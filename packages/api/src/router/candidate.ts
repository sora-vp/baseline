import { TRPCError } from "@trpc/server";
import amqp from "amqplib";

import { prisma } from "@sora/db";
import {
  adminDeleteCandidateValidationSchema,
  adminGetSpecificCandidateValidationSchema,
  upvoteValidationSchema,
} from "@sora/schema-config/admin.candidate.schema";
import { canVoteNow } from "@sora/settings";

import { env } from "../../env.mjs";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const QUEUE_NAME = "vote_queue";

export const candidateRouter = createTRPCRouter({
  candidateList: publicProcedure.query(() =>
    prisma.candidate.findMany({
      select: {
        id: true,
        name: true,
        img: true,
      },
    }),
  ),

  statisticList: protectedProcedure.query(() =>
    prisma.candidate.findMany({ select: { name: true, counter: true } }),
  ),

  adminCandidateList: protectedProcedure.query(() =>
    prisma.candidate.findMany(),
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

    if (!candidates || candidates.length < 1)
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
      const inVotingCondition = canVoteNow();

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

  upvote: publicProcedure
    .input(upvoteValidationSchema)
    .mutation(async ({ input }) => {
      try {
        const connection = await amqp.connect(env.AMQP_URL);

        try {
          const messageFromQueue: { success: boolean; message?: string } =
            await new Promise(async (resolve, reject) => {
              const channel = await connection.createChannel();

              const { queue } = await channel.assertQueue(QUEUE_NAME, {
                durable: true,
              });

              const payload = JSON.stringify(input);

              const response = await channel.assertQueue("");
              const correlationId = response.queue;

              const timeout = setTimeout(async () => {
                await channel.deleteQueue(QUEUE_NAME);
                await channel.close();

                reject(
                  new Error("Timeout: No response received from consumer."),
                );
              }, 30_000);

              await channel.consume(
                correlationId,
                (msg) => {
                  if (!msg) {
                    reject(
                      "Publisher has been cancelled or channel has been closed.",
                    );
                    return;
                  }

                  if (msg.properties.correlationId === correlationId) {
                    clearTimeout(timeout);

                    resolve(JSON.parse(msg.content.toString()));
                    channel.ack(msg);
                  }
                },
                { noAck: true },
              );

              channel.sendToQueue(queue, Buffer.from(payload), {
                correlationId,
                replyTo: correlationId,
              });
            });

          if (!messageFromQueue.success)
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: messageFromQueue.message as string,
            });

          return { message: "Berhasil memilih kandidat!" };
        } finally {
          void connection.close();
        }
      } catch (e) {
        console.error(e);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Gagal memproses pemilihan, mohon hubungi panitia dan coba lagi nanti.",
        });
      }
    }),
});

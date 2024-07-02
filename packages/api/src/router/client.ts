import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import amqp from "amqplib";

import {
  eq,
  preparedGetCandidates,
  preparedGetParticipantAttended,
  preparedGetParticipantStatus,
  schema,
  sql,
} from "@sora-vp/db";
import settings, { canAttendNow } from "@sora-vp/settings";
import { candidate, participant } from "@sora-vp/validators";

import { publicProcedure } from "../trpc";

const QUEUE_NAME = "vote_queue";

export const clientRouter = {
  settings: publicProcedure.query(() => {
    const { canLogin: _, ...rest } = settings.getSettings();

    return rest;
  }),

  participantAttend: publicProcedure
    .input(participant.ParticipantAttendSchema)
    .mutation(async ({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        if (!canAttendNow())
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Belum diperbolehkan untuk melakukan absensi!",
          });

        const participantRawQuery = await tx.execute(sql`
          SELECT * FROM ${schema.participants} WHERE ${schema.participants.qrId} = ${input} FOR UPDATE
        `);

        const participantContainer = participantRawQuery.at(0) as unknown as {
          name: string;
          already_attended: boolean;
          qr_id: string;
          sub_part: string;
        }[];

        const participant = participantContainer.at(0);

        if (!participant)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Peserta pemilihan tidak dapat ditemukan!",
          });

        if (participant.already_attended)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Anda sudah absen!",
          });

        await tx
          .update(schema.participants)
          .set({
            alreadyAttended: true,
            attendedAt: new Date(),
          })
          .where(eq(schema.participants.qrId, input));

        return {
          name: participant.name,
          qrId: participant.qr_id,
          subpart: participant.sub_part,
        };
      }),
    ),

  checkParticipantAttended: publicProcedure
    .input(participant.ParticipantAttendSchema)
    .mutation(async ({ input }) => {
      const participant = await preparedGetParticipantAttended.execute({
        qrId: input,
      });

      if (!participant)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Peserta pemilihan tidak dapat ditemukan!",
        });

      if (participant.alreadyChoosing)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Anda sudah memilih kandidat!",
        });

      if (!participant.alreadyAttended)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Anda belum absen!",
        });
    }),

  getParticipantStatus: publicProcedure
    .input(participant.ParticipantAttendSchema)
    .query(({ input }) =>
      preparedGetParticipantStatus.execute({ qrId: input }),
    ),

  getCandidates: publicProcedure.query(() => preparedGetCandidates.execute()),

  upvote: publicProcedure
    .input(candidate.ServerUpvoteCandidate)
    .mutation(async ({ input }) => {
      try {
        // Sudah di cek oleh env.ts pada runtime next js,
        // tinggal ambil value dari process.env saja
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const connection = await amqp.connect(process.env.AMQP_URL!);

        try {
          const messageFromQueue: { success: boolean; message?: string } =
            // eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
            await new Promise(async (resolve, reject) => {
              const channel = await connection.createChannel();

              const { queue } = await channel.assertQueue(QUEUE_NAME, {
                durable: true,
              });

              const payload = JSON.stringify(input);

              const response = await channel.assertQueue("");
              const correlationId = response.queue;

              // eslint-disable-next-line @typescript-eslint/no-misused-promises
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

                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              message: messageFromQueue.message!,
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
} satisfies TRPCRouterRecord;

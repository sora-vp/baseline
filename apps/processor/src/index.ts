/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-misused-promises  */
import amqp from "amqplib";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import { validateId } from "@sora-vp/id-generator";

import { api } from "./api";
import { db, schema } from "./db";
import { env } from "./env";
import { initLogger } from "./logger";
import { canVoteNow } from "./utils";

const inputValidator = z.object({
  id: z.number().positive(),
  qrId: z.string().refine(validateId),
});

export const consumeMessagesFromQueue = async (loggerDirectory: string) => {
  const logger = initLogger(loggerDirectory);

  try {
    logger.debug(`[MQ] MQ AMQP: ${env.AMQP_URL}`);
    logger.debug(`[TRPC] TRPC URL: ${env.PROCESSOR_API_URL}`);

    logger.info("[MQ] Connecting to RabbitMQ instance");

    const connection = await amqp.connect(env.AMQP_URL);
    const channel = await connection.createChannel();

    const exchange = "vote";
    const queue = "vote_queue";
    const routingKey = "vote_rpc";

    await channel.assertExchange(exchange, "direct", { durable: true });
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, routingKey);

    logger.info("[MQ] Connected! Waiting for queue...");

    await channel.consume(queue, async (msg) => {
      if (!msg) {
        logger.warn("Consumer has been cancelled or channel has been closed.");
        return;
      }

      try {
        const settings = await api.clientConsumer.settings.query();
        const inVotingCondition = canVoteNow(settings);

        const inputData = await inputValidator.safeParseAsync(
          JSON.parse(msg.content.toString()),
        );

        if (!inputData.success) {
          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(
              JSON.stringify({
                success: false,
                message:
                  "Data yang dijadikam permintaan tidak sesuai dengan standar yang ditetapkan!",
              }),
            ),
            { correlationId: msg.properties.correlationId },
          );

          channel.ack(msg);
          logger.trace(`[MQ] Isn't a valid request data`);

          return;
        }

        logger.info(`[MQ] New message! QR ID: ${inputData.data.qrId}`);

        if (!inVotingCondition) {
          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(
              JSON.stringify({
                success: false,
                message:
                  "Tidak bisa memilih kandidat jika bukan dalam kondisi pemilihan!",
              }),
            ),
            { correlationId: msg.properties.correlationId },
          );

          channel.ack(msg);
          logger.trace(
            `[MQ] Isn't a valid time yet for voting. QR ID: ${inputData.data.qrId}`,
          );

          return;
        }

        await db.transaction(async (tx) => {
          const participantRawQuery = await tx.execute(
            sql`SELECT * FROM ${schema.participants} WHERE ${schema.participants.qrId} = ${inputData.data.qrId} FOR UPDATE`,
          );

          const participantContainer = participantRawQuery.at(0) as unknown as {
            name: string;
            already_attended: number;
            already_choosing: number;
            qr_id: string;
            sub_part: string;
          }[];

          const participant = participantContainer.at(0);

          if (!participant) {
            channel.sendToQueue(
              msg.properties.replyTo,
              Buffer.from(
                JSON.stringify({
                  error: "Anda tidak terdaftar sebagai peserta!",
                }),
              ),
              { correlationId: msg.properties.correlationId },
            );

            channel.ack(msg);
            logger.trace(
              `[MQ] Participant isn't exist. QR ID: ${inputData.data.qrId}`,
            );

            return;
          }

          if (participant.already_choosing === 1) {
            channel.sendToQueue(
              msg.properties.replyTo,
              Buffer.from(JSON.stringify({ error: "Anda sudah memilih!" })),
              { correlationId: msg.properties.correlationId },
            );

            channel.ack(msg);
            logger.trace(
              `[MQ] Participant already chosen someone. QR ID: ${inputData.data.qrId}`,
            );

            return;
          }

          if (participant.already_attended !== 1) {
            channel.sendToQueue(
              msg.properties.replyTo,
              Buffer.from(JSON.stringify({ error: "Anda belum absen!" })),
              { correlationId: msg.properties.correlationId },
            );

            channel.ack(msg);
            logger.trace(
              `[MQ] Participant isn't attended yet. QR ID: ${inputData.data.qrId}`,
            );

            return;
          }

          const candidateRawQuery = await tx.execute(
            sql`SELECT count(*) AS candidate_must_one FROM ${schema.candidates} WHERE ${schema.candidates.id} = ${inputData.data.id} FOR UPDATE`,
          );

          const candidateContainer = candidateRawQuery.at(0) as unknown as {
            candidate_must_one: number;
          }[];

          const candidate = candidateContainer.at(0);

          if (candidate?.candidate_must_one !== 1) {
            channel.sendToQueue(
              msg.properties.replyTo,
              Buffer.from(
                JSON.stringify({ error: "Kandidat yang dipilih tidak ada!" }),
              ),
              { correlationId: msg.properties.correlationId },
            );

            channel.ack(msg);
            logger.trace(
              `[MQ] Candidate isn't exist. QR ID: ${inputData.data.qrId}`,
            );

            return;
          }

          await tx
            .update(schema.candidates)
            .set({
              counter: sql`${schema.candidates.counter} + 1`,
            })
            .where(eq(schema.candidates.id, inputData.data.id));

          await tx
            .update(schema.participants)
            .set({
              alreadyChoosing: true,
              choosingAt: new Date(),
            })
            .where(eq(schema.participants.qrId, inputData.data.qrId));
        });

        logger.info(`[MQ] Upvote! QR ID: ${inputData.data.qrId}`);

        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify({ success: true })),
          { correlationId: msg.properties.correlationId },
        );

        channel.ack(msg);
      } catch (error) {
        logger.error(error);

        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify({ error: "Internal Server Error" })),
          { correlationId: msg.properties.correlationId },
        );

        channel.ack(msg);
      }
    });
  } catch (error) {
    logger.error(error);
  }
};

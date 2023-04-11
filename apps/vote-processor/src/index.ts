import { PrismaClient } from "database";
import amqp from "amqplib";

import "dotenv/config";

import { env } from "./env";
import { logger } from "./logger";

import { trpc } from "./trpc";
import { canVoteNow } from "./canVoteNow";

const prisma = new PrismaClient();

const consumeMessagesFromQueue = async () => {
  try {
    logger.info("[DB] Connecting to Database...");

    await prisma.$connect();

    logger.info("[DB] Connected!");

    if (!env.AMQP_URL) throw new Error("Diperlukan AQMP URL!");

    logger.info("[MQ] Connecting to RabbitMQ instance");

    const connection = await amqp.connect(env.AMQP_URL);
    const channel = await connection.createChannel();

    const exchange = "vote";
    const queue = "vote_queue";
    const routingKey = "vote_rpc";

    await channel.assertExchange(exchange, "direct", { durable: false });
    await channel.assertQueue(queue, { durable: false });
    await channel.bindQueue(queue, exchange, routingKey);
    await channel.prefetch(1);

    logger.info("[MQ] Connected! Waiting for queue...");

    channel.consume(queue, async (msg) => {
      if (!msg) {
        logger.warn("Consumer has been cancelled or channel has been closed.");
        return;
      }

      const settings = await trpc.settings.getSettings.query();
      const inVotingCondition = canVoteNow(settings);

      const { id, qrId } = JSON.parse(msg.content.toString());

      logger.info(`[MQ] New message! QR ID: ${qrId}`);

      if (!inVotingCondition) {
        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(
            JSON.stringify({
              success: false,
              message:
                "Tidak bisa memilih kandidat jika bukan dalam kondisi pemilihan!",
            })
          ),
          { correlationId: msg.properties.correlationId }
        );

        channel.ack(msg);
        logger.trace(`[MQ] Isn't a valid time yet for voting. QR ID: ${qrId}`);

        return;
      }

      const isCandidateExist = await prisma.candidate.findUnique({
        where: { id },
      });

      if (!isCandidateExist) {
        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(
            JSON.stringify({
              success: false,
              message: "Kandidat tidak dapat ditemukan!",
            })
          ),
          { correlationId: msg.properties.correlationId }
        );

        channel.ack(msg);
        logger.trace(`[MQ] Candidate isn't exist. QR ID: ${qrId}`);

        return;
      }

      const participant = await prisma.participant.findUnique({
        where: { qrId },
      });

      if (!participant) {
        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(
            JSON.stringify({
              success: false,
              message: "Kamu belum terdaftar dalam daftar peserta pemilihan!",
            })
          ),
          { correlationId: msg.properties.correlationId }
        );

        channel.ack(msg);
        logger.trace(`[MQ] Participant isn't exist. QR ID: ${qrId}`);

        return;
      }

      if (participant.alreadyChoosing) {
        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(
            JSON.stringify({ success: false, message: "Kamu sudah memilih!" })
          ),
          { correlationId: msg.properties.correlationId }
        );

        channel.ack(msg);
        logger.trace(
          `[MQ] Participant already choosing someone. QR ID: ${qrId}`
        );

        return;
      }

      if (!participant.alreadyAttended) {
        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(
            JSON.stringify({ success: false, message: "Kamu belum absen!" })
          ),
          { correlationId: msg.properties.correlationId }
        );

        channel.ack(msg);
        logger.trace(`[MQ] Participant isn't attended yet. QR ID: ${qrId}`);

        return;
      }

      try {
        await prisma.$transaction([
          prisma.candidate.update({
            where: { id },
            data: {
              counter: {
                increment: 1,
              },
            },
          }),
          prisma.participant.update({
            where: { qrId },
            data: {
              alreadyChoosing: true,
              choosingAt: new Date(),
            },
          }),
        ]);

        logger.info(`[MQ] Upvote! QR ID: ${qrId}`);

        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify({ success: true })),
          { correlationId: msg.properties.correlationId }
        );

        channel.ack(msg);
      } catch (err) {
        logger.error(err);

        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(
            JSON.stringify({
              success: false,
              message:
                "Gagal memproses pemilihan, mohon hubungi panitia dan coba lagi nanti.",
            })
          ),
          { correlationId: msg.properties.correlationId }
        );

        channel.ack(msg);
      }
    });
  } catch (error) {
    logger.error(error);
  }
};

consumeMessagesFromQueue();

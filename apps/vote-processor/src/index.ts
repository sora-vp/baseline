import { canVoteNow, prisma } from "sora";
import amqp from "amqplib";

import { env } from "./env";

if (!env.AMQP_URL) throw new Error("Diperlukan AQMP URL!");

const consumeMessagesFromQueue = async () => {
  try {
    const connection = await amqp.connect(env.AMQP_URL);
    const channel = await connection.createChannel();

    const exchange = "vote";
    const queue = "vote_queue";
    const routingKey = "vote_rpc";

    await channel.assertExchange(exchange, "direct", { durable: false });
    await channel.assertQueue(queue, { durable: false });
    await channel.bindQueue(queue, exchange, routingKey);
    await channel.prefetch(1);

    console.log("[MQ] Waiting for queue");

    channel.consume(queue, async (msg) => {
      if (!msg) {
        console.log("Consumer has been cancelled or channel has been closed.");
        return;
      }

      const inVotingCondition = await canVoteNow();

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
        return;
      }

      const { id, qrId } = JSON.parse(msg.content.toString());

      console.log("[MQ] New message!", { id, qrId });

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

        console.log("[MQ] Upvote!", { qrId });

        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify({ success: true })),
          { correlationId: msg.properties.correlationId }
        );

        channel.ack(msg);
      } catch (err) {
        console.error(err);

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
    console.error(error);
  }
};

consumeMessagesFromQueue();

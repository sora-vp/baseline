import { prisma } from "sora";
import amqp from "amqplib";

import { env } from "./env";

if (!env.AMQP_URL) throw new Error("Diperlukan AQMP URL!");

const consumeMessagesFromQueue = async () => {
  try {
    const connection = await amqp.connect(env.AMQP_URL);
    const channel = await connection.createChannel();

    // Declare the queue and prefetch 1 message at a time
    const queueName = "votes";
    await channel.assertQueue(queueName, { durable: true });
    channel.prefetch(1);

    // Consume messages from the queue
    channel.consume(queueName, async (message) => {
      if (!message) throw new Error("invalid messages!");

      const payload = JSON.parse(message.content.toString());

      // Find the candidate and participant in the database
      const candidate = await prisma.candidate.findUnique({
        where: { id: payload.id },
      });
      const participant = await prisma.participant.findUnique({
        where: { qrId: payload.qrId },
      });

      // Check if the candidate and participant exist
      if (!candidate || !participant) {
        console.error("Candidate or participant not found!");
        channel.ack(message);
        return;
      }

      // Check if the participant has already voted
      if (participant.alreadyChoosing) {
        console.error(
          "Participant has already voted!",
          participant.name,
          candidate.name
        );
        channel.ack(message);
        return;
      }

      // Increment the candidate's counter and update the participant status
      await prisma.$transaction([
        prisma.candidate.update({
          where: { id: candidate.id },
          data: {
            counter: {
              increment: 1,
            },
          },
        }),
        prisma.participant.update({
          where: { qrId: participant.qrId },
          data: {
            alreadyChoosing: true,
            choosingAt: new Date(),
          },
        }),
      ]);

      console.log(
        `Vote counted for candidate ${candidate.name}!`,
        participant.name,
        candidate.name
      );
      channel.ack(message);
    });
  } catch (error) {
    console.error(error);
  }
};

consumeMessagesFromQueue();

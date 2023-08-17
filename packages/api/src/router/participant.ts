import { TRPCError } from "@trpc/server";

import { prisma, type Participant } from "@sora/db";
import { nanoid } from "@sora/id-generator";
import {
  DeletePesertaValidationSchema,
  PaginatedParticipantValidationSchema,
  ParticipantAttendValidationSchema,
  ParticipantBySubpartValidationSchema,
  TambahPesertaManyValidationSchema,
  TambahPesertaValidationSchema,
  UpdateParticipantValidationSchema,
} from "@sora/schema-config/admin.participant.schema";
import { canAttendNow } from "@sora/settings";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const participantRouter = createTRPCRouter({
  getParticipantPaginated: protectedProcedure
    .input(PaginatedParticipantValidationSchema)
    .query(async ({ input: { pageSize: limit, pageIndex: offset } }) => {
      const participants = await prisma.participant.findMany({
        skip: offset,
        take: limit,
      });

      const totalParticipants = await prisma.participant.count();
      const pageCount = Math.ceil(totalParticipants / limit);
      const currentPage = Math.ceil(offset / limit) + 1;

      return {
        participants,
        pageCount,
        currentPage,
      };
    }),

  getSpecificParticipant: protectedProcedure
    .input(ParticipantAttendValidationSchema)
    .query(async ({ input: qrId }) => {
      const participant = await prisma.participant.findUnique({
        where: { qrId },
        select: { name: true, qrId: true, subpart: true },
      });

      if (!participant)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Peserta pemilihan tidak dapat ditemukan!",
        });

      return participant;
    }),

  updateParticipant: protectedProcedure
    .input(UpdateParticipantValidationSchema)
    .mutation(async ({ input }) => {
      const participant = await prisma.participant.findUnique({
        where: { qrId: input.qrId },
      });

      if (!participant)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Peserta pemilihan tidak dapat ditemukan!",
        });

      await prisma.participant.update({
        where: {
          qrId: input.qrId,
        },
        data: {
          name: input.name,
          subpart: input.subpart,
        },
      });

      return { message: "Berhasil memperbarui informasi peserta!" };
    }),

  createNewParticipant: protectedProcedure
    .input(TambahPesertaValidationSchema)
    .mutation(async ({ input }) => {
      await prisma.participant.create({
        data: {
          name: input.name,
          subpart: input.subpart,
          qrId: nanoid(),
        },
      });

      return { message: "Berhasil menambahkan peserta baru!" };
    }),

  insertManyParticipant: protectedProcedure
    .input(TambahPesertaManyValidationSchema)
    .mutation(async ({ input }) => {
      const okToInsert = input.map((data) => ({
        name: data.Nama,
        subpart: data["Bagian Dari"],
        qrId: nanoid(),
      }));

      const checkThing = await Promise.all(
        okToInsert.map(({ name }) =>
          prisma.participant.findUnique({ where: { name } }),
        ),
      );

      if (checkThing.every((data) => data !== null)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Semua data yang ingin di upload sudah terdaftar!",
        });
      }

      if (checkThing.some((data) => data !== null)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Beberapa data yang ingin di upload sudah ada!",
        });
      }

      await prisma.participant.createMany({
        data: okToInsert,
      });

      return { message: "Berhasil mengupload data file csv!" };
    }),

  deleteParticipant: protectedProcedure
    .input(DeletePesertaValidationSchema)
    .mutation(async ({ input }) => {
      if (canAttendNow())
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message:
            "Tidak di izinkan untuk menghapus peserta karena masih dalam masa diperbolehkan absen!",
        });

      const participant = await prisma.participant.findUnique({
        where: { id: input.id },
      });

      if (!participant)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Peserta pemilihan tidak dapat ditemukan!",
        });

      if (participant.alreadyAttended)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Peserta pemilihan sebelumnya sudah absen!",
        });

      if (participant.alreadyChoosing)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Peserta pemilihan sebelumnya sudah memilih!",
        });

      await prisma.participant.delete({ where: { id: input.id } });

      return { message: "Berhasil menghapus peserta!" };
    }),

  subparts: protectedProcedure.query(async () => {
    const participants = await prisma.participant.findMany({
      select: { subpart: true },
    });

    if (!participants)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Data peserta pemilihan masih kosong!",
      });

    const subparts = [...new Set(participants.map(({ subpart }) => subpart))];

    return { subparts };
  }),

  getParticipantBySubpart: protectedProcedure
    .input(ParticipantBySubpartValidationSchema)
    .query(async ({ input }) => {
      if (input.subpart === "") return { participants: [] };

      const participants = await prisma.participant.findMany({
        where: {
          subpart: input.subpart,
        },
      });

      return { participants };
    }),

  participantAttend: publicProcedure
    .input(ParticipantAttendValidationSchema)
    .mutation(async ({ input }) => {
      const participantCanAttend = canAttendNow();

      if (!participantCanAttend)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Belum diperbolehkan untuk melakukan absensi!",
        });

      await prisma.$transaction(async (tx) => {
        const _participant = await tx.$queryRaw<
          Participant[]
        >`SELECT * FROM Participant WHERE qrId = ${input} FOR UPDATE`;
        const participant = _participant[0];

        if (!participant)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Peserta pemilihan tidak dapat ditemukan!",
          });

        if (participant.alreadyAttended)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Kamu sudah absen!",
          });

        await tx.participant.update({
          where: { qrId: input },
          data: {
            alreadyAttended: true,
            attendedAt: new Date(),
          },
        });
      });

      return { message: "Berhasil melakukan absensi!" };
    }),

  isParticipantAlreadyAttended: publicProcedure
    .input(ParticipantAttendValidationSchema)
    .mutation(async ({ input }) => {
      const participant = await prisma.participant.findUnique({
        where: { qrId: input },
      });

      if (!participant)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Peserta pemilihan tidak dapat ditemukan!",
        });

      if (participant.alreadyChoosing)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kamu sudah memilih kandidat!",
        });

      if (!participant.alreadyAttended)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kamu belum absen!",
        });

      return { success: true };
    }),

  exportJsonData: protectedProcedure.query(async () => {
    const participants = await prisma.participant.findMany();

    if (!participants)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tidak ada data peserta pemilihan!",
      });

    const remapped = participants.map((participant) => ({
      name: participant.name,
      qrId: participant.qrId,
    }));

    return { data: JSON.stringify(remapped, null, 2) };
  }),

  getParticipantStatus: publicProcedure
    .input(ParticipantAttendValidationSchema)
    .query(async ({ input }) => {
      const participant = await prisma.participant.findUnique({
        where: { qrId: input },
      });

      if (!participant)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Peserta pemilihan tidak dapat ditemukan!",
        });

      return {
        alreadyAttended: participant.alreadyAttended,
        alreadyChoosing: participant.alreadyChoosing,
      };
    }),
});

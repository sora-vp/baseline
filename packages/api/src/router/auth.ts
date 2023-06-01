import { TRPCError } from "@trpc/server";
import bcrypt from "bcrypt";

import { prisma } from "@sora/db";
import {
  ChangeNameSchemaValidator,
  ServerChangePasswordSchemaValidator,
  ServerRegisterSchemaValidator,
} from "@sora/schema-config/auth.schema";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const authRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { email: ctx.session.user?.email as string },
    });
    if (!user)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Pengguna tidak dapat ditemukan!",
      });
    return {
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }),

  register: publicProcedure
    .input(ServerRegisterSchemaValidator)
    .mutation(async ({ input }) => {
      const isAlreadyExist = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (isAlreadyExist)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Pengguna dengan email yang sama sudah terdaftar!",
        });

      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(input.password, salt);

      await prisma.user.create({
        data: {
          email: input.email,
          name: input.name,
          password: hash,
        },
      });

      return {
        success: true,
      };
    }),

  changePassword: protectedProcedure
    .input(ServerChangePasswordSchemaValidator)
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.user.findUnique({
        where: {
          email: ctx.session.user?.email as string,
        },
      });

      if (!user)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pengguna tidak dapat ditemukan!",
        });

      const isCurrentPasswordValid = await bcrypt.compare(
        input.lama,
        user.password,
      );

      if (!isCurrentPasswordValid)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kata sandi yang dimasukkan tidak sesuai!",
        });

      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(input.baru, salt);

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          password: hash,
        },
      });

      return {
        message: "Berhasil mengubah kata sandi!",
      };
    }),

  changeName: protectedProcedure
    .input(ChangeNameSchemaValidator)
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.user.findUnique({
        where: {
          email: ctx.session.user?.email as string,
        },
      });

      if (!user)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pengguna tidak dapat ditemukan!",
        });

      const currentNameSameAsNewName = user.name === input.name;

      if (currentNameSameAsNewName)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Nama yang baru tidak boleh sama dengan yang lama!",
        });

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          name: input.name,
        },
      });

      return {
        message: "Berhasil mengubah nama pengguna!",
      };
    }),
});

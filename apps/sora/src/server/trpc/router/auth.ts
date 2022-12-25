import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";

import { router, publicProcedure, protectedProcedure } from "../trpc";
import {
  ChangeNameSchemaValidator,
  ServerRegisterSchemaValidator,
  ServerChangePasswordSchemaValidator,
} from "@schema/auth.schema";

import { UserModel } from "@models/index";

export const authRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await UserModel.getByEmail(ctx.session.user?.email as string);

    if (!user)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Pengguna tidak dapat ditemukan!",
      });

    return {
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    };
  }),

  register: publicProcedure
    .input(ServerRegisterSchemaValidator)
    .mutation(async ({ input }) => {
      const isAlreadyExist = await UserModel.getByEmail(input.email);

      if (isAlreadyExist)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Pengguna dengan email yang sama sudah terdaftar!",
        });

      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(input.password, salt);

      const newUser = new UserModel({
        email: input.email,
        username: input.nama,
        password: hash,
      });

      await newUser.save();

      return {
        success: true,
      };
    }),

  changePassword: protectedProcedure
    .input(ServerChangePasswordSchemaValidator)
    .mutation(async ({ ctx, input }) => {
      const user = await UserModel.getByEmail(
        ctx.session.user?.email as string
      );

      if (!user)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pengguna tidak dapat ditemukan!",
        });

      const isCurrentPasswordValid = await bcrypt.compare(
        input.lama,
        user.password
      );

      if (!isCurrentPasswordValid)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kata sandi yang dimasukkan tidak sesuai!",
        });

      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(input.baru, salt);

      user.password = hash;

      await user.save();

      return {
        message: "Berhasil mengubah kata sandi!",
      };
    }),

  changeName: protectedProcedure
    .input(ChangeNameSchemaValidator)
    .mutation(async ({ ctx, input }) => {
      const user = await UserModel.getByEmail(
        ctx.session.user?.email as string
      );

      if (!user)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pengguna tidak dapat ditemukan!",
        });

      const currentNameSameAsNewName = user.username === input.nama;

      if (currentNameSameAsNewName)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Nama yang baru tidak boleh sama dengan yang lama!",
        });

      user.username = input.nama;

      await user.save();

      return {
        message: "Berhasil mengubah nama pengguna!",
      };
    }),
});

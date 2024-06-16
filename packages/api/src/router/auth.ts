import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcrypt";

import { countUserTable, preparedGetUserByEmail, schema } from "@sora-vp/db";
import { auth as authValidator } from "@sora-vp/validators";

import { publicProcedure } from "../trpc";

export const authRouter = {
  register: publicProcedure
    .input(authValidator.ServerRegisterSchema)
    .mutation(async ({ ctx, input }) => {
      if (ctx.session)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Tidak bisa membuat pengguna baru karena anda sudah login!",
        });

      const isUserExist = await preparedGetUserByEmail.execute({
        email: input.email,
      });

      if (isUserExist)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Pengguna dengan email yang sama sudah terdaftar!",
        });

      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(input.password, salt);

      const userTable = await countUserTable.execute();
      const availUser = userTable.at(0);
      const autoAdmin = availUser && availUser.count < 1;

      await ctx.db.insert(schema.users).values({
        ...input,
        password: hash,
        verifiedAt: autoAdmin ? new Date() : null,
        role: autoAdmin ? "admin" : null,
      });

      return {
        success: true,
      };
    }),
} satisfies TRPCRouterRecord;

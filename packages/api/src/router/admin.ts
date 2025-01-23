import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";

import { and, eq, not, sql } from "@sora-vp/db";
import * as schema from "@sora-vp/db/schema";
import { admin } from "@sora-vp/validators";

import { adminProcedure } from "../trpc";

export const adminRouter = {
  // user approval and rejection start from here
  getPendingUser: adminProcedure.query(({ ctx }) =>
    ctx.db.query.users.findMany({
      where: and(
        sql`${schema.users.verifiedAt} IS NULL`,

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        not(eq(schema.users.email, ctx.session.user.email!)),
      ),
    }),
  ),

  rejectPendingUser: adminProcedure
    .input(admin.ServerAcceptObjectIdNumber)
    .mutation(({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        const specificUser = await tx.query.users.findFirst({
          where: eq(schema.users.id, input.id),
        });

        if (!specificUser)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Pengguna yang dituju tidak ditemukan!",
          });

        if (specificUser.verifiedAt)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Pengguna sudah di approve!",
          });

        await tx.delete(schema.users).where(eq(schema.users.id, input.id));
      }),
    ),

  acceptPendingUser: adminProcedure
    .input(admin.ServerAcceptIdAndRole)
    .mutation(({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        const specificUser = await tx.query.users.findFirst({
          where: eq(schema.users.id, input.id),
        });

        if (!specificUser)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Pengguna yang dituju tidak ditemukan!",
          });

        if (ctx.session.user.email === specificUser.email)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "R u lost ur mind?",
          });

        if (specificUser.verifiedAt)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Pengguna sudah di approve!",
          });

        return await tx
          .update(schema.users)
          .set({
            verifiedAt: new Date(),
            role: input.role,
          })
          .where(eq(schema.users.id, input.id));
      }),
    ),

  updateUserRole: adminProcedure
    .input(admin.ServerAcceptIdAndRole)
    .mutation(({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        const specificUser = await tx.query.users.findFirst({
          where: eq(schema.users.id, input.id),
        });

        if (!specificUser)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Pengguna yang dituju tidak ditemukan!",
          });

        if (ctx.session.user.email === specificUser.email)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Mana bisa begitu? Update role sendiri?",
          });

        return await tx
          .update(schema.users)
          .set({
            role: input.role,
          })
          .where(eq(schema.users.id, input.id));
      }),
    ),

  getAllRegisteredUser: adminProcedure.query(({ ctx }) =>
    ctx.db.query.users.findMany({
      where: and(
        sql`${schema.users.verifiedAt} IS NOT NULL`,

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        not(eq(schema.users.email, ctx.session.user.email!)),
      ),
    }),
  ),
} satisfies TRPCRouterRecord;

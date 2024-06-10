import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { and, eq, not, schema, sql } from "@sora-vp/db";

import { adminProcedure } from "../trpc";

export const adminRouter = {
  // user approval and rejection start from here
  getPendingUser: adminProcedure.query(({ ctx }) =>
    ctx.db.query.users.findMany({
      where: and(
        sql`${schema.users.verifiedAt} IS NULL`,
        not(eq(schema.users.email, ctx.session.user.email)),
      ),
    }),
  ),

  rejectPendingUser: adminProcedure
    .input(z.object({ id: z.number() }))
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
    .input(
      z.object({
        id: z.number(),
        role: z.enum(["admin", "comittee"]),
      }),
    )
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

        if (specificUser.emailVerified)
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
} satisfies TRPCRouterRecord;

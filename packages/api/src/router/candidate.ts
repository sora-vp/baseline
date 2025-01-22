import { Buffer } from "buffer";
import { existsSync, mkdirSync } from "fs";
import { unlink, writeFile } from "fs/promises";
import path from "path";
import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import mime from "mime-types";

import { eq } from "@sora-vp/db";
import { preparedAdminGetCandidates } from "@sora-vp/db/client";
import schema from "@sora-vp/db/schema";
import { randomFileName } from "@sora-vp/id-generator";
import { canVoteNow } from "@sora-vp/settings";
import { candidate } from "@sora-vp/validators";

import { adminProcedure } from "../trpc";

// Don't worry, it automatically goes to the web app public directory
const NEXT_ROOT_PATH = path.join(path.resolve(), "public/uploads");

export const candidateRouter = {
  candidateQuery: adminProcedure.query(() =>
    preparedAdminGetCandidates.execute(),
  ),

  createNewCandidate: adminProcedure
    .input(candidate.ServerAddNewCandidate)
    .mutation(({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        if (canVoteNow())
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message:
              "Tidak bisa menambahkan kandidat baru pada saat kondisi pemilihan!",
          });

        const fileName = `${randomFileName()}.${mime.extension(input.type)}`;

        if (!existsSync(NEXT_ROOT_PATH)) mkdirSync(NEXT_ROOT_PATH);

        const imageContent = Buffer.from(input.image, "base64");

        await writeFile(path.join(NEXT_ROOT_PATH, fileName), imageContent);

        return await tx.insert(schema.candidates).values({
          name: input.name,
          image: fileName,
        });
      }),
    ),

  updateCandidate: adminProcedure
    .input(candidate.ServerUpdateCandidate)
    .mutation(({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        if (canVoteNow())
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message:
              "Tidak bisa mengubah kandidat baru pada saat kondisi pemilihan!",
          });

        const candidate = await tx.query.candidates.findFirst({
          where: eq(schema.candidates.id, input.id),
        });

        if (!candidate)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Kandidat yang ingin di ubah tidak ditemukan!",
          });

        if (!input.image && !input.type)
          return await tx
            .update(schema.candidates)
            .set({
              name: input.name,
            })
            .where(eq(schema.candidates.id, input.id));

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const fileName = `${randomFileName()}.${mime.extension(input.type!)}`;

        if (!existsSync(NEXT_ROOT_PATH)) mkdirSync(NEXT_ROOT_PATH);

        // remove previous image if exist
        if (existsSync(path.join(NEXT_ROOT_PATH, candidate.image)))
          await unlink(path.join(NEXT_ROOT_PATH, candidate.image));

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const imageContent = Buffer.from(input.image!, "base64");

        await writeFile(path.join(NEXT_ROOT_PATH, fileName), imageContent);

        return await tx
          .update(schema.candidates)
          .set({
            name: input.name,
            image: fileName,
          })
          .where(eq(schema.candidates.id, input.id));
      }),
    ),

  deleteCandidate: adminProcedure
    .input(candidate.ServerDeleteCandidate)
    .mutation(({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        if (canVoteNow())
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message:
              "Tidak bisa menghapus kandidat baru pada saat kondisi pemilihan!",
          });

        const candidate = await tx.query.candidates.findFirst({
          where: eq(schema.candidates.id, input.id),
        });

        if (!candidate)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Kandidat yang ingin di ubah tidak ditemukan!",
          });

        if (candidate.counter > 0)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Tidak bisa menghapus kandidat karena sudah ada yang memilih!",
          });

        if (existsSync(path.join(NEXT_ROOT_PATH, candidate.image)))
          await unlink(path.join(NEXT_ROOT_PATH, candidate.image));

        return await tx
          .delete(schema.candidates)
          .where(eq(schema.candidates.id, input.id));
      }),
    ),
} satisfies TRPCRouterRecord;

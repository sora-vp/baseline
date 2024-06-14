import { Buffer } from "buffer";
import { existsSync, mkdirSync } from "fs";
import { writeFile } from "fs/promises";
import path from "path";
import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import mime from "mime-types";

import {
  //   eq,
  preparedAdminGetCandidates,
  //   preparedGetExcelParticipants,
  schema,
} from "@sora-vp/db";
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
} as TRPCRouterRecord;

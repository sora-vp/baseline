import type { TRPCRouterRecord } from "@trpc/server";

// import { and, eq, not, schema, sql } from "@sora-vp/db";
// import { admin } from "@sora-vp/validators";

import { protectedProcedure } from "../trpc";

export const participantRouter = {
  getAllParticipants: protectedProcedure.query(async () => {
    return [];
  }),
} satisfies TRPCRouterRecord;

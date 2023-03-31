import { createTRPCRouter } from "~/server/api/trpc";

import { authRouter } from "~/server/api/routers/auth";
import { participantRouter } from "~/server/api/routers/participant";
import { candidateRouter } from "~/server/api/routers/candidate";
import { settingsRouter } from "~/server/api/routers/settings";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  candidate: candidateRouter,
  settings: settingsRouter,
  participant: participantRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

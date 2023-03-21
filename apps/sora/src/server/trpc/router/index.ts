// src/server/trpc/router/index.ts
import { router } from "../trpc";

import { authRouter } from "./auth";
import { participantRouter } from "./participant";
import { candidateRouter } from "./candidate";
import { settingsRouter } from "./settings";

export const appRouter = router({
  auth: authRouter,
  candidate: candidateRouter,
  settings: settingsRouter,
  participant: participantRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

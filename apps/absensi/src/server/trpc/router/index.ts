// src/server/trpc/router/index.ts
import { router } from "../trpc";

import { authRouter } from "./auth";
import { settingsRouter } from "./settings";
import { participantRouter } from "./participant";

export const appRouter = router({
  auth: authRouter,
  settings: settingsRouter,
  participant: participantRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

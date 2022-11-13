// src/server/trpc/router/index.ts
import { router } from "../trpc";

import { authRouter } from "./auth";
import { paslonRouter } from "./paslon";
import { settingsRouter } from "./settings";

export const appRouter = router({
  auth: authRouter,
  paslon: paslonRouter,
  settings: settingsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

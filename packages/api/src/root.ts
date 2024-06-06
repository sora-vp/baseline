import { authRouter } from "./router/auth";
import { settingsRouter } from "./router/settings";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  settings: settingsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

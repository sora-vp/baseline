import { adminRouter } from "./router/admin";
import { authRouter } from "./router/auth";
import { candidateRouter } from "./router/candidate";
import { participantRouter } from "./router/participant";
import { settingsRouter } from "./router/settings";
import { statisticRouter } from "./router/statistic";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  admin: adminRouter,
  candidate: candidateRouter,
  statistic: statisticRouter,
  settings: settingsRouter,
  participant: participantRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

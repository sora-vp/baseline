import { createNextApiHandler } from "@trpc/server/adapters/next";

import { appRouter, createTRPCContext } from "@sora/api";

import { withCors } from "~/utils/cors";

// export API handler
export default withCors(
  createNextApiHandler({
    router: appRouter,
    createContext: createTRPCContext,
  }),
);

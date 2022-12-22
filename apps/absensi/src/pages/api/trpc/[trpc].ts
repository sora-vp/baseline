// src/pages/api/trpc/[trpc].ts
import { createNextApiHandler } from "@trpc/server/adapters/next";
import { appRouter } from "../../../server/trpc/router";
import { createContext } from "../../../server/trpc/context";
import { env } from "../../../env/server.mjs";
import { connectDatabase } from "../../../utils/database";
import { withCors } from "../../../utils/cors";

connectDatabase();

// export API handler
export default withCors(
  createNextApiHandler({
    router: appRouter,
    createContext,
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(`❌ tRPC failed on ${path}: ${error}`);
          }
        : undefined,
  })
);

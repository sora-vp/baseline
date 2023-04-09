import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";

import { env } from "./env";

import type { SoraAppRouter } from "sora";

export const trpc = createTRPCProxyClient<SoraAppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: env.TRPC_URL,
    }),
  ],
});

export type RouterOutputs = inferRouterOutputs<SoraAppRouter>;

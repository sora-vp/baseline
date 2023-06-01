import { createTRPCProxyClient, httpLink } from "@trpc/client";
import { type inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";

import type { AppRouter } from "@sora/api";

import { env } from "./env";

export const trpc = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpLink({
      url: env.TRPC_URL,
    }),
  ],
});

export type RouterOutputs = inferRouterOutputs<AppRouter>;

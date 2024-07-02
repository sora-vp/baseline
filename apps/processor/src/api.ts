import type { AppRouter } from "@sora-vp/api";
import { createTRPCProxyClient, httpLink } from "@trpc/client";
import { type inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";

import { env } from "./env";

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpLink({
      url: env.PROCESSOR_API_URL,
      transformer: superjson,
    }),
  ],
});

export type RouterOutputs = inferRouterOutputs<AppRouter>;

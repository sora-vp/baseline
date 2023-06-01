import type { inferRouterOutputs } from "@trpc/server";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@sora/api";

export const trpc = createTRPCReact<AppRouter>();

export type AppRouterOutput = inferRouterOutputs<AppRouter>;

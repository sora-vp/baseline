import type { inferRouterOutputs } from "@trpc/server";
import { createTRPCReact } from "@trpc/react-query";
import type { SoraAppRouter } from "sora";

export const soraTRPC = createTRPCReact<SoraAppRouter>();

export type SoraRouterOutput = inferRouterOutputs<SoraAppRouter>;

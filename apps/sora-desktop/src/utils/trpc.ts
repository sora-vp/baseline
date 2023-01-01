import type { inferRouterOutputs } from "@trpc/server";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "trpc-glue";

export const trpc = createTRPCReact<AppRouter>();

export type SoraRouterOutput = inferRouterOutputs<AppRouter>["sora"];
export type AbsensiRouterOutput = inferRouterOutputs<AppRouter>["absensi"];

import type { inferRouterOutputs } from "@trpc/server";
import { createTRPCReact } from "@trpc/react-query";
import type { SoraAppRouter } from "sora";
import type { AbsensiAppRouter } from "absensi";

export const soraTRPC = createTRPCReact<SoraAppRouter>();
export const absensiTRPC = createTRPCReact<AbsensiAppRouter>();

export type SoraRouterOutput = inferRouterOutputs<SoraAppRouter>;
export type AbsensiRouterOutput = inferRouterOutputs<AbsensiAppRouter>;

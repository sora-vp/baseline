import type { inferRouterOutputs } from "@trpc/server";
import { createTRPCReact } from "@trpc/react-query";
import type { AbsensiAppRouter } from "absensi";

export const trpc = createTRPCReact<AbsensiAppRouter>();

export type AppRouterOutput = inferRouterOutputs<AbsensiAppRouter>;

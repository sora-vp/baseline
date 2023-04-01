import type { inferRouterOutputs } from "@trpc/server";
import { createTRPCReact } from "@trpc/react-query";

import type { SoraAppRouter } from "sora";

export const trpc = createTRPCReact<SoraAppRouter>();

export type RouterOutput = inferRouterOutputs<SoraAppRouter>;

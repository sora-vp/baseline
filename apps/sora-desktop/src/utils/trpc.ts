import { createTRPCReact } from "@trpc/react-query";
import type { SoraAppRouter } from "sora";

export const soraTRPC = createTRPCReact<SoraAppRouter>();

import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "",
  client: {},

  server: {
    AMQP_URL: z.string().url(),
    TRPC_URL: z.string().url(),
  },
  runtimeEnv: {
    AMQP_URL: process.env.AMQP_URL,
    TRPC_URL: process.env.TRPC_URL,
  },
  skipValidation: !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION,
});

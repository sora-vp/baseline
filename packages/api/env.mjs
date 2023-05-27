import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "",
  client: {},

  server: {
    AMQP_URL: z.string().url(),
  },
  runtimeEnvStrict: {
    AMQP_URL: process.env.AMQP_URL,
  },
  skipValidation: !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION,
});

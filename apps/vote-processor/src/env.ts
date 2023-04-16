import { z } from "zod";
import path from "path";

import dotenv from "dotenv";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  AMQP_URL: z.string().url(),
  TRPC_URL: z.string().url(),
});

const result = dotenv.config({
  path: path.join(__dirname, "..", ".env"),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (result?.error) throw new Error(result.error as any);

export const env = envSchema.parse(result.parsed);

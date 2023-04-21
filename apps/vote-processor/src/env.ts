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

export const env = envSchema.parse(result.parsed ?? process.env);

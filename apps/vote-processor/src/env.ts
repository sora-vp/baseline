import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  AMQP_URL: z.string().url(),
  TRPC_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);

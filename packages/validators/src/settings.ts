import { z } from "zod";

const canLogin = z.boolean();

const SharedCanLogin = z.object({
  canLogin,
});

const SharedBehaviour = z.object({
  canVote: z.boolean(),
  canAttend: z.boolean(),
});

export const settings = {
  SharedCanLogin,
  SharedBehaviour,
} as const;

import { z } from "zod";

export const PengaturanPerilakuValidationSchema = z.object({
  canAttend: z.boolean(),
});

export type PengaturanPerilakuFormValues = z.infer<
  typeof PengaturanPerilakuValidationSchema
>;

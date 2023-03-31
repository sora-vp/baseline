import { z } from "zod";

export const PengaturanPerilakuValidationSchema = z.object({
  canVote: z.boolean(),
  reloadAfterVote: z.boolean(),
  canAttend: z.boolean(),
});

export type PengaturanPerilakuFormValues = z.infer<
  typeof PengaturanPerilakuValidationSchema
>;

export const ServerPengaturanWaktuValidationSchema = z
  .object({
    startTime: z.date({
      required_error: "Diperlukan kapan waktu mulai pemilihan!",
    }),
    endTime: z.date({
      required_error: "Diperlukan kapan waktu selesai pemilihan!",
    }),
  })
  .refine((data) => data.startTime < data.endTime, {
    path: ["endTime"],
    message: "Waktu selesai tidak boleh kurang dari waktu mulai!",
  });

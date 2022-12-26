import { z } from "zod";

const validNameRegex = /^[a-zA-Z\s\-]+$/;

export const TambahPesertaValidationSchema = z.object({
  nama: z
    .string()
    .min(1, { message: "Diperlukan nama peserta!" })
    .regex(validNameRegex, {
      message: "Bidang nama harus berupa nama yang valid!",
    }),
  keterangan: z
    .string()
    .min(1, { message: "Diperlukan keterangan partisipan!" }),
});

export type TambahFormValues = z.infer<typeof TambahPesertaValidationSchema>;

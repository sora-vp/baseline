import { z } from "zod";

const validNameRegex =
  /^(?![ -.&,_'":?!])(?!.*[- &_'":]$)(?!.*[-.#@&,:?!]{2})[a-zA-Z- .,']+$/;

export const TambahPesertaValidationSchema = z.object({
  nama: z
    .string()
    .min(1, { message: "Diperlukan nama peserta!" })
    .regex(validNameRegex, {
      message: "Bidang nama harus berupa nama yang valid!",
    }),
  status: z.string().min(1, { message: "Diperlukan status partisipan!" }),
});

export type TambahFormValues = z.infer<typeof TambahPesertaValidationSchema>;

import { z } from "zod";
import { validateId } from "id-generator";

const baseNameSchema = z
  .string()
  .min(1, { message: "Diperlukan nama peserta!" });

export const TambahPesertaValidationSchema = z.object({
  nama: baseNameSchema,
});

export const TambahPesertaManyValidationSchema = z.array(
  z.object({ Nama: baseNameSchema })
);

export const UploadPartisipanValidationSchema = z.object({
  csv: z
    .any()
    .refine((files) => files?.length == 1, "Diperlukan file csv!")
    .refine(
      (files) => files?.[0]?.type === "text/csv",
      "Hanya format file csv yang diterima!"
    ),
});

export type TUploadFormValues = { csv: FileList };

export const DeletePesertaValidationSchema = z.object({ id: z.number() });

export type TambahFormValues = z.infer<typeof TambahPesertaValidationSchema>;

export const PaginatedParticipantValidationSchema = z.object({
  pageSize: z.number().min(10),
  pageIndex: z.number().min(0),
});

export const ParticipantByCategoryValidationSchema = z.object({
  category: z.string(),
});

export const ParticipantAttendValidationSchema = z.string().refine(validateId);

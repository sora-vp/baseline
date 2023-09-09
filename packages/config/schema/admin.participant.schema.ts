import { z } from "zod";

import { validateId } from "@sora/id-generator";

const baseNameSchema = z
  .string()
  .min(1, { message: "Diperlukan nama peserta!" })
  .regex(/^[a-zA-Z0-9.,'\s]+$/, {
    message:
      "Hanya diperbolehkan menulis alfabet, angka, koma, petik satu, dan titik!",
  });
const baseSubpartSchema = z
  .string()
  .min(1, { message: "Diperlukan bagian darimana peserta ini!" })
  .regex(/^[a-zA-Z0-9-_]+$/, {
    message: "Hanya diperbolehkan menulis alfabet, angka, dan garis bawah!",
  });

export const TambahPesertaValidationSchema = z.object({
  name: baseNameSchema,
  subpart: baseSubpartSchema,
});

export const TambahPesertaManyValidationSchema = z.array(
  z.object({ Nama: baseNameSchema, "Bagian Dari": baseSubpartSchema }),
);

export const UploadPartisipanValidationSchema = z.object({
  csv: z
    .any()
    .refine((files) => files?.length == 1, "Diperlukan file csv!")
    .refine(
      (files) => files?.[0]?.type === "text/csv",
      "Hanya format file csv yang diterima!",
    ),
});

export type TUploadFormValues = { csv: FileList };

export const DeletePesertaValidationSchema = z.object({ id: z.number() });

export type TambahFormValues = z.infer<typeof TambahPesertaValidationSchema>;

export const PaginatedParticipantValidationSchema = z.object({
  pageSize: z.number().min(10),
  pageIndex: z.number().min(0),
});

export const ParticipantBySubpartValidationSchema = z.object({
  subpart: z.string(),
});

export const ParticipantAttendValidationSchema = z.string().refine(validateId);

export const UpdateParticipantValidationSchema = z.object({
  name: baseNameSchema,
  subpart: baseSubpartSchema,
  qrId: ParticipantAttendValidationSchema,
});

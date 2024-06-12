import { z } from "zod";

import { validateId } from "@sora-vp/id-generator";

const baseNameSchema = z
  .string()
  .min(1, { message: "Diperlukan nama peserta!" })
  .regex(/^[a-zA-Z0-9.,'\s`-]+$/, {
    message:
      "Hanya diperbolehkan menulis alfabet, angka, koma, petik satu, dan titik!",
  });
const baseSubpartSchema = z
  .string()
  .min(1, { message: "Diperlukan bagian darimana peserta ini!" })
  .regex(/^[a-zA-Z0-9-_]+$/, {
    message: "Hanya diperbolehkan menulis alfabet, angka, dan garis bawah!",
  });

const SharedAddParticipant = z.object({
  name: baseNameSchema,
  subpart: baseSubpartSchema,
});

const SharedUploadManyParticipant = z.array(
  z.object({ Nama: baseNameSchema, "Bagian Dari": baseSubpartSchema }),
);

const UploadParticipantSchema = z.object({
  csv: z
    .any()
    .refine((files) => files?.length == 1, "Diperlukan file csv!")
    .refine(
      (files) => files?.[0]?.type === "text/csv",
      "Hanya format file csv yang diterima!",
    ),
});

const ParticipantAttendSchema = z.string().refine(validateId);

const ServerDeleteParticipant = z.object({ qrId: ParticipantAttendSchema });

const ServerUpdateParticipant = z.object({
  name: baseNameSchema,
  subpart: baseSubpartSchema,
  qrId: ParticipantAttendSchema,
});

export const participant = {
  SharedAddParticipant,
  SharedUploadManyParticipant,
  UploadParticipantSchema,
  ServerDeleteParticipant,
  ParticipantAttendSchema,
  ServerUpdateParticipant,
} as const;

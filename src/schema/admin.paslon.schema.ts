import { z } from "zod";

const validNameRegex = /^[a-zA-Z\s\-]+$/;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const baseAddAndEditForm = z.object({
  ketua: z
    .string()
    .min(1, { message: "Diperlukan nama ketua!" })
    .regex(validNameRegex, {
      message: "Bidang nama harus berupa nama yang valid!",
    }),
  wakil: z
    .string()
    .min(1, { message: "Diperlukan nama wakil!" })
    .regex(validNameRegex, {
      message: "Bidang nama harus berupa nama yang valid!",
    }),
});

export const TambahPaslonValidationSchema = baseAddAndEditForm.merge(
  z.object({
    image: z
      .any()
      .refine((files) => files?.length == 1, "Diperlukan gambar paslon!")
      .refine(
        (files) => files?.[0]?.size <= 200000,
        `Ukuran maksimal gambar adalah 2MB!`
      )
      .refine(
        (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
        "Hanya format gambar .jpg, .jpeg, .png dan .webp yang diterima!"
      ),
  })
);

export type TambahFormValues = {
  ketua: string;
  wakil: string;
  image: File;
};

export const adminDeleteCandidateAndUpvoteValidationSchema = z.object({
  id: z.string().min(1),
  timeZone: z.string().min(1),
});

export const adminGetSpecificCandidateValidationSchema = z.object({
  id: z.string().min(1),
});

export const EditPaslonValidationSchema = baseAddAndEditForm.merge(
  z.object({
    image: z
      .any()
      .refine(
        (files) => (files === undefined ? true : files?.length === 1),
        "Diperlukan gambar paslon!"
      )
      .refine(
        (files) => (files === undefined ? true : files?.[0]?.size <= 200000),
        `Ukuran maksimal gambar adalah 2MB!`
      )
      .refine(
        (files) =>
          files === undefined
            ? true
            : ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
        "Hanya format gambar .jpg, .jpeg, .png dan .webp yang diterima!"
      ),
  })
);

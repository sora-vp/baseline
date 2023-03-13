import { z } from "zod";

const TwoMegs = 2_000_000;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const baseAddAndEditForm = z.object({
  kandidat: z.string().min(1, { message: "Diperlukan nama kandidat!" }),
});

export const TambahKandidatValidationSchema = baseAddAndEditForm.merge(
  z.object({
    image: z
      .any()
      .refine((files) => files?.length == 1, "Diperlukan gambar paslon!")
      .refine(
        (files) => files?.[0]?.size <= TwoMegs,
        `Ukuran maksimal gambar adalah 2MB!`
      )
      .refine(
        (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
        "Hanya format gambar .jpg, .jpeg, .png dan .webp yang diterima!"
      ),
  })
);

export type TambahFormValues = {
  kandidat: string;
  image: File;
};

export const adminDeleteCandidateAndUpvoteValidationSchema = z.object({
  id: z.string().min(1),
  timeZone: z.string().min(1),
});

export const adminGetSpecificCandidateValidationSchema = z.object({
  id: z.string().min(1),
});

export const EditKandidatValidationSchema = baseAddAndEditForm.merge(
  z.object({
    image: z
      .any()
      .refine(
        (files) => (files === undefined ? true : files?.length === 1),
        "Diperlukan gambar paslon!"
      )
      .refine(
        (files) => (files === undefined ? true : files?.[0]?.size <= TwoMegs),
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

export type TEditKandidatValidationSchema = {
  kandidat: string;
  image: File;
};

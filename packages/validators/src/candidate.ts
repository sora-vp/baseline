import { Base64 } from "js-base64";
import { z } from "zod";

import { validateId } from "@sora-vp/id-generator";

const TwoMegs = 2_000_000;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const id = z.number().min(1);
const baseAddAndEditForm = z.object({
  name: z.string().min(1, { message: "Diperlukan nama kandidat!" }),
});

const AddNewCandidateSchema = baseAddAndEditForm.merge(
  z.object({
    image: z
      .any()
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .refine((files) => files?.length == 1, "Diperlukan gambar kandidat!")
      .refine(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (files) => files?.[0]?.size <= TwoMegs,
        `Ukuran maksimal gambar adalah 2MB!`,
      )
      .refine(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
        "Hanya format gambar .jpg, .jpeg, .png dan .webp yang diterima!",
      ),
  }),
);

const ServerAddNewCandidate = baseAddAndEditForm.merge(
  z.object({
    image: z.string().refine(Base64.isValid),
    type: z.string(),
  }),
);

const UpdateCandidateSchema = baseAddAndEditForm.merge(
  z.object({
    image: z
      .any()
      .refine(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (files) => (files.length === 0 ? true : files?.length === 1),
        "Diperlukan gambar kandidat!",
      )
      .refine(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (files) => (files.length === 0 ? true : files?.[0]?.size <= TwoMegs),
        `Ukuran maksimal gambar adalah 2MB!`,
      )
      .refine(
        (files) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          files.length === 0
            ? true
            : // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
              ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
        "Hanya format gambar .jpg, .jpeg, .png dan .webp yang diterima!",
      ),
  }),
);

const ServerUpdateCandidate = baseAddAndEditForm.merge(
  z.object({
    id,
    image: z.optional(z.string().refine(Base64.isValid)),
    type: z.optional(z.string()),
  }),
);

const ServerDeleteCandidate = z.object({ id });

const ServerUpvoteCandidate = ServerDeleteCandidate.merge(
  z.object({
    qrId: z.string().refine(validateId),
  }),
);

export const candidate = {
  AddNewCandidateSchema,
  ServerAddNewCandidate,
  UpdateCandidateSchema,
  ServerUpdateCandidate,
  ServerDeleteCandidate,
  ServerUpvoteCandidate,
} as const;

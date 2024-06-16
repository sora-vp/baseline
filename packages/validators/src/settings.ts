import { z } from "zod";

const canLogin = z.boolean();

const SharedCanLogin = z.object({
  canLogin,
});

const SharedBehaviour = z.object({
  canVote: z.boolean(),
  canAttend: z.boolean(),
});

const startTimeError = "Diperlukan kapan waktu mulai pemilihan!";
const endTimeError = "Diperlukan kapan waktu selesai pemilihan!";

const SharedDuration = z
  .object({
    startTime: z.date({
      errorMap: (issue, { defaultError }) => ({
        message:
          issue.code === "invalid_type"
            ? startTimeError
            : defaultError,
      }),
    }),
    endTime: z.date({
      errorMap: (issue, { defaultError }) => ({
        message:
          issue.code === "invalid_type"
            ? endTimeError
            : defaultError,
      }),
    }),
  })
  .refine((data) => data.startTime < data.endTime, {
    path: ["endTime"],
    message: "Waktu selesai tidak boleh kurang dari waktu mulai!",
  });

export const settings = {
  SharedCanLogin,
  SharedBehaviour,
  SharedDuration,
} as const;

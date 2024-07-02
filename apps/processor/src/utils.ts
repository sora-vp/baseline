import type { RouterOutputs } from "./api";

type TSettings = RouterOutputs["clientConsumer"]["settings"];

export const canVoteNow = (settings: TSettings) => {
  const waktuMulai = settings.startTime ? settings.startTime.getTime() : null;
  const waktuSelesai = settings.endTime ? settings.endTime.getTime() : null;

  const currentTime = new Date().getTime();

  const canVote =
    (waktuMulai as number) <= currentTime &&
    (waktuSelesai as number) >= currentTime &&
    result.canVote;

  return canVote;
};

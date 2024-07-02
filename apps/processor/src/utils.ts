import type { RouterOutputs } from "./api";

type TSettings = RouterOutputs["clientConsumer"]["settings"];

export const canVoteNow = (settings: TSettings) => {
  const waktuMulai = settings.startTime ? settings.startTime.getTime() : null;
  const waktuSelesai = settings.endTime ? settings.endTime.getTime() : null;

  const currentTime = new Date().getTime();

  const canVote =
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    waktuMulai! <= currentTime &&
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    waktuSelesai! >= currentTime &&
    settings.canVote;

  return canVote;
};

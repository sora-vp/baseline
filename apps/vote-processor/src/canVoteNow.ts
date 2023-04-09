import { DateTime } from "luxon";

import type { RouterOutputs } from "./trpc";

type TSettings = RouterOutputs["settings"]["getSettings"];

const getTimePermission = (settings: TSettings) => {
  const currentTime = DateTime.now().toUTC().toJSDate().getTime();

  const timeConfig = {
    mulai: settings?.startTime
      ? DateTime.fromISO(settings?.startTime as unknown as string, {
          zone: "utc",
        })
          .toJSDate()
          .getTime()
      : false,
    selesai: settings?.endTime
      ? DateTime.fromISO(settings?.endTime as unknown as string, {
          zone: "utc",
        })
          .toJSDate()
          .getTime()
      : false,
  };

  return {
    isPermittedByTime:
      // Start
      (timeConfig.mulai
        ? (timeConfig.mulai as number) <= currentTime
        : false) &&
      // End
      (timeConfig.selesai
        ? (timeConfig.selesai as number) >= currentTime
        : false),
  };
};

export const canVoteNow = (settings: TSettings) => {
  const { isPermittedByTime } = getTimePermission(settings);

  return (
    isPermittedByTime &&
    settings?.canVote !== null &&
    settings?.canVote !== false
  );
};

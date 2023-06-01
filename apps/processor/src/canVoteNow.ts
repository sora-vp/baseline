import { DateTime } from "luxon";

import type { RouterOutputs } from "./trpc";

type TSettings = RouterOutputs["settings"]["getSettings"];

const getTimePermission = (settings: TSettings) => {
  const currentTime = DateTime.now().toUTC().toJSDate().getTime();

  const timeConfig = {
    mulai: settings?.startTime ? settings.startTime.getTime() : false,
    selesai: settings?.endTime ? settings.endTime.getTime() : false,
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

  return isPermittedByTime && settings.canVote;
};

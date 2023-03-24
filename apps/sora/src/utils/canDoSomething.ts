import { DateTime } from "luxon";
import settingsLib from "./settings";

const getTimePermission = async () => {
  const settings = await settingsLib.read();

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
      timeConfig?.mulai <= currentTime && timeConfig?.selesai >= currentTime,
    settings,
  };
};

export const canVoteNow = async () => {
  const { isPermittedByTime, settings } = await getTimePermission();

  return (
    isPermittedByTime &&
    settings?.canVote !== null &&
    settings?.canVote !== false
  );
};

export const canAttendNow = async () => {
  const { isPermittedByTime, settings } = await getTimePermission();

  return (
    isPermittedByTime &&
    settings?.canAttend !== null &&
    settings?.canAttend !== false
  );
};

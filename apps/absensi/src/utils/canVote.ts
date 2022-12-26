import { DateTime } from "luxon";
import settingsLib from "./settings";

export const canVoteNow = async (timeZone: string) => {
  const settings = await settingsLib.read();

  const currentTime = DateTime.now().setZone(timeZone).toJSDate().getTime();
  const timeConfig = {
    mulai: settings?.startTime
      ? DateTime.fromISO(settings?.startTime as unknown as string)
          .setZone(timeZone)
          .toJSDate()
          .getTime()
      : false,
    selesai: settings?.endTime
      ? DateTime.fromISO(settings?.endTime as unknown as string)
          .setZone(timeZone)
          .toJSDate()
          .getTime()
      : false,
  };

  return (
    timeConfig?.mulai <= currentTime &&
    timeConfig?.selesai >= currentTime &&
    settings?.canAttend !== null &&
    settings?.canAttend !== false
  );
};

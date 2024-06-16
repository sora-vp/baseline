import { settings } from "./SettingsManager";

export { settings as default } from "./SettingsManager";

const getTimePermission = () => {
  const currentSettings = settings.getSettings();
  const currentTime = new Date().getTime();

  const currentTimeIsBiggerThanStart =
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    currentSettings.startTime && currentSettings.startTime
      ? currentTime >= currentSettings.startTime.getTime()
      : false;

  const currentTimeIsSmallerThanEnd =
    currentSettings.startTime && currentSettings.endTime
      ? currentTime <= currentSettings.endTime.getTime()
      : false;

  return {
    isPermittedByTime:
      currentTimeIsBiggerThanStart && currentTimeIsSmallerThanEnd,
    settings: currentSettings,
  };
};

export const canVoteNow = () => {
  const { isPermittedByTime, settings } = getTimePermission();

  return isPermittedByTime && settings.canVote;
};

export const canAttendNow = () => {
  const { isPermittedByTime, settings } = getTimePermission();

  return isPermittedByTime && settings.canAttend;
};

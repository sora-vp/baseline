import { settings } from "./SettingsManager";

export { settings as default } from "./SettingsManager";

const getTimePermission = () => {
  const currentSettings = settings.getSettings();
  const currentTime = new Date().getTime();

  const currentTimeIsBiggerThanStart =
    currentSettings.startTime &&
    currentTime >= currentSettings.startTime.getTime();

  const currentTimeIsSmallerThanEnd =
    currentSettings.startTime &&
    currentTime <= currentSettings.endTime.getTime();

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

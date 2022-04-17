import { DateTime } from "luxon";

export const formatTime = (time: DateTime): string =>
  time.toFormat("cccc, dd MMMM yyyy, hh:mm:ss a");

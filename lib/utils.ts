import { DateTime } from "luxon";

export const formatTime = (time: DateTime): string =>
  time.toFormat("cccc, dd MMMM yyyy, hh:mm:ss a");

export const getBaseUrl = (req: any): string => {
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const baseUrl = req ? `${protocol}://${req.headers.host}` : "";

  return baseUrl;
};

import { DateTime } from "luxon";

export const formatTime = (time: DateTime): string =>
  time.toFormat("cccc, dd MMMM yyyy, hh:mm:ss a");

export const getBaseUrl = (): string => {
  if (process.env.NODE_ENV === "production" && !process.env.PRODUCTION_URL)
    throw new Error("DIPERLUKAN URL PRODUCTION!");

  const baseUrl =
    process.env.NODE_ENV === "production"
      ? new URL(process.env.PRODUCTION_URL as string).origin
      : "http://localhost:3000";

  return baseUrl;
};

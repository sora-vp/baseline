import type { IUser } from "@/models/User";
import { DateTime } from "luxon";

export interface safeUserTransformatorInterface {
  username: string;
  email: string;
  date: DateTime;
}

export const safeUserTransformator = (
  user: IUser
): safeUserTransformatorInterface => ({
  username: user.username,
  email: user.email,
  date: user.date,
});

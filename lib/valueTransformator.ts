import type { IUser } from "@/models/User";

export interface safeUserTransformatorInterface {
  username: string;
  email: string;
  date: Date;
}

export const safeUserTransformator = (
  user: IUser
): safeUserTransformatorInterface => ({
  username: user.username,
  email: user.email,
  date: user.date,
});

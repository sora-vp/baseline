import type { IUser } from "@/models/User";
import type { IPaslon } from "@/models/Paslon";
import { DateTime } from "luxon";
import { Types } from "mongoose";

export interface safeUserTransformatorInterface {
  username: string;
  email: string;
  date: DateTime;
}

export interface SafePaslonTransformatorInterface {
  _id: Types.ObjectId;
  ketua: string;
  wakil: string;
  imgName: string;
}

export const safeUserTransformator = (
  user: IUser
): safeUserTransformatorInterface => ({
  username: user.username,
  email: user.email,
  date: user.date,
});

export const safePaslonTransformator = (
  paslon: IPaslon[]
): SafePaslonTransformatorInterface[] =>
  paslon.map((p: SafePaslonTransformatorInterface) => ({
    _id: p._id,
    ketua: p.ketua,
    wakil: p.wakil,
    imgName: p.imgName,
  }));

import { getModelForClass } from "@typegoose/typegoose";
import { createConnection } from "mongoose";

import { env } from "../env/server.mjs";

import { Kandidat, Candidate } from "./Kandidat";
import { User } from "./User";

export const KandidatBackupModel = getModelForClass(Candidate, {
  // @ts-ignore
  existingConnection: createConnection(env.MONGODB_SLAVE_URI),
});
export const KandidatModel = getModelForClass(Kandidat);
export const UserModel = getModelForClass(User);

export { Kandidat, User };

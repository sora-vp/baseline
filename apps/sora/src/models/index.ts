import { getModelForClass } from "@typegoose/typegoose";

import { Kandidat } from "./Kandidat";
import { User } from "./User";

export const KandidatModel = getModelForClass(Kandidat);
export const UserModel = getModelForClass(User);

export { Kandidat, User };

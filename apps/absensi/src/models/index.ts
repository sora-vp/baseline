import { getModelForClass } from "@typegoose/typegoose";

import { Paslon } from "./Paslon";
import { User } from "./User";

export const PaslonModel = getModelForClass(Paslon);
export const UserModel = getModelForClass(User);

export { Paslon, User };

import { getModelForClass } from "@typegoose/typegoose";

import { Participant } from "./Participant";
import { User } from "./User";

export const ParticipantModel = getModelForClass(Participant);
export const UserModel = getModelForClass(User);

export { Participant, User };

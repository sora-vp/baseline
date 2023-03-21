import { getModelForClass } from "@typegoose/typegoose";

import { Participant } from "./Participant";
import { Kandidat } from "./Kandidat";
import { User } from "./User";

export const ParticipantModel = getModelForClass(Participant);
export const KandidatModel = getModelForClass(Kandidat);
export const UserModel = getModelForClass(User);

export { Participant, Kandidat, User };

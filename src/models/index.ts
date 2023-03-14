import { getModelForClass } from "@typegoose/typegoose";
import mongoose from "mongoose";

import { env } from "../env/server.mjs";

import { Kandidat, Candidate } from "./Kandidat";
import { User } from "./User";

const connection = mongoose.createConnection(env.MONGODB_SLAVE_URI, {
  bufferCommands: false,
});

const formatter = (state: mongoose.ConnectionStates) => {
  const prefix = `DB (SLAVE):`;

  switch (state) {
    case mongoose.ConnectionStates.connected:
      return `${prefix} Connected`;

    case mongoose.ConnectionStates.connecting:
      return `${prefix} Connecting`;

    case mongoose.ConnectionStates.disconnected:
      return `${prefix} UNABLE TO CONNECT | DISCONNECTED`;

    case mongoose.ConnectionStates.disconnecting:
      return `${prefix} DISCONNECTING...`;

    case mongoose.ConnectionStates.uninitialized:
    default:
      return "N/A";
  }
};

connection.addListener("open", () =>
  console.log(formatter(connection.readyState))
);
connection.addListener("close", () =>
  console.log(formatter(connection.readyState))
);
connection.addListener("error", () =>
  console.error(formatter(connection.readyState))
);

export const KandidatBackupModel = getModelForClass(Candidate, {
  existingConnection: connection,
});
export const KandidatModel = getModelForClass(Kandidat);
export const UserModel = getModelForClass(User);

export { Kandidat, User };

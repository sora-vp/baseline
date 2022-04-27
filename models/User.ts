import mongoose, { Schema, Types, Model } from "mongoose";
import { DateTime } from "luxon";
import bcrypt from "bcrypt";

type createNewUserParam = {
  email: string;
  username: string;
  password: string;
};

export interface IUser {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  date: DateTime;
}

export interface UserModel extends Model<IUser> {
  getUserByEmail(email: string): Promise<IUser>;
  createNewUser({
    email,
    username,
    password,
  }: createNewUserParam): Promise<IUser>;
}

const UserSchema = new Schema<IUser, UserModel>({
  username: {
    type: String,
    required: true,
    match: /^[a-zA-Z\s\-]+$/,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  },
  password: {
    required: true,
    type: String,
  },
  date: {
    required: false,
    type: Date,
    default: () => DateTime.now().toUTC(),
  },
});
UserSchema.static(
  "getUserByEmail",
  async function getUserByEmail(email: string) {
    const user = await this.findOne({ email });
    return user;
  }
);
UserSchema.static(
  "createNewUser",
  async function createNewUser({
    email,
    username,
    password,
  }: createNewUserParam) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const newUser = new this({
      email,
      username,
      password: hash,
    });

    await newUser.save();

    return newUser;
  }
);

export default (mongoose.models.User as UserModel) ||
  mongoose.model<IUser, UserModel>("User", UserSchema);

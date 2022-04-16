import mongoose, { Types, Model } from "mongoose";

export interface IUser {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  date: Date;
}

const UserSchema = new mongoose.Schema<IUser, Model<IUser>>({
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
    default: Date.now,
  },
});

export default (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser, Model<IUser>>("User", UserSchema);

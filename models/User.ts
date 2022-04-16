import mongoose from "mongoose";

export interface IUser {
  username: string;
  email: string;
  password: string;
  date: Date;
}

const UserSchema = new mongoose.Schema<IUser>({
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

const User =
  (mongoose.models.User as IUser) || mongoose.model<IUser>("User", UserSchema);

export default User;

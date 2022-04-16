// @ts-nocheck

// import crypto from "crypto";
// import { v4 as uuidv4 } from "uuid";

// import type { NextApiRequest } from "next";

// type userType = {
//   id: string;
//   createdAt: number;
//   username: string;
//   name: string;
//   hash: string;
// };

// let users: userType[] = [];

// export function getAllUsers() {
//   // For demo purpose only. You are not likely to have to return all users.
//   return users;
// }

// export function createUser(
//   _req: NextApiRequest,
//   { username, password, name }: { username: any; password: any; name: any }
// ) {
//   // Here you should create the user and save the salt and hashed password (some dbs may have
//   // authentication methods that will do it for you so you don't have to worry about it):
//   const salt = crypto.randomBytes(16).toString("hex");
//   const hash = crypto
//     .pbkdf2Sync(password, salt, 1000, 64, "sha512")
//     .toString("hex");
//   const user = {
//     id: uuidv4(),
//     createdAt: Date.now(),
//     username,
//     name,
//     hash,
//     salt,
//   };

//   // Here you should insert the user into the database
//   // await db.createUser(user)
//   users.push(user);
// }

// export function findUserByUsername(_req: NextApiRequest, username: string) {
//   // Here you find the user based on id/username in the database
//   // const user = await db.findUserById(id)
//   return users.find((user) => user.username === username);
// }

// export function updateUserByUsername(_req: any, username: string, update: any) {
//   // Here you update the user based on id/username in the database
//   // const user = await db.updateUserById(id, update)
//   const user = users.find((u) => u.username === username);
//   Object.assign(user, update);
//   return user;
// }

// export function deleteUser(
//   req: { user: { username: string } },
//   _username: any
// ) {
//   // Here you should delete the user in the database
//   // await db.deleteUser(req.user)
//   users = users.filter((user) => user.username !== req.user.username);
// }

// // Compare the password of an already fetched user (using `findUserByUsername`) and compare the
// // password for a potential match
// export function validatePassword(
//   user: {
//     id?: string;
//     createdAt?: number;
//     username?: string;
//     name?: string;
//     hash: any;
//     salt?: any;
//   },
//   inputPassword: crypto.BinaryLike
// ) {
//   const inputHash = crypto
//     .pbkdf2Sync(inputPassword, user.salt, 1000, 64, "sha512")
//     .toString("hex");
//   const passwordsMatch = user.hash === inputHash;
//   return passwordsMatch;
// }

import mongoose from "mongoose";

const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  throw new Error(
    "Please define the MONGO_URL environment variable inside .env.local"
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGO_URL, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

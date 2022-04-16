import nextConnect from "next-connect";
import auth from "@/middleware/auth";
import { safeUserTransformator } from "@/lib/valueTransformator";

// import User from "@/lib/User";

import type { NextApiRequest, NextApiResponse } from "next";

interface requestInterface extends NextApiRequest {
  user: any;
}

const handler = nextConnect<
  requestInterface,
  NextApiResponse<AlertErrorResponse | UserSuccessResponse>
>();

handler.use(auth).get((req, res) => {
  res.json({ user: safeUserTransformator(req.user?.toObject()) });
});
// .use((req, res, next) => {
//   // handlers after this (PUT, DELETE) all require an authenticated user
//   // This middleware to check if user is authenticated before continuing
//   if (!req.user) {
//     res.status(401).send("unauthenticated");
//   } else {
//     next();
//   }
// })
// .put((req, res) => {
//   const { name } = req.body;
//   const user = updateUserByUsername(req, req.user.username, { name });
//   res.json({ user });
// })
// .delete((req, res) => {
//   req.logOut();
//   res.status(204).end();
// });

export default handler;

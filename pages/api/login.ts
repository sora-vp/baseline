import nextConnect from "next-connect";
import auth from "@/middleware/auth";
import passport from "@/lib/passport";
import { connectDatabase } from "@/lib/db";
import type { IUser } from "@/lib/db";

import type { NextApiRequest, NextApiResponse } from "next";

type Response = {
  user: IUser;
};

const handler = nextConnect<NextApiRequest, NextApiResponse<Response>>();

handler.use(auth).post(
  async (req, res, next) => {
    await connectDatabase();
    next();
  },
  passport.authenticate("local"),
  (req, res) => res.json({ user: req.user })
);

export default handler;

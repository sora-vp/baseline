import nextConnect from "next-connect";
import auth from "@/middleware/auth";
import passport from "@/lib/passport";
import { connectDatabase } from "@/lib/db";
import { safeUserTransformator } from "@/lib/valueTransformator";

import type { NextApiRequest, NextApiResponse } from "next";

interface requestInterface extends NextApiRequest {
  user: any;
}

const handler = nextConnect<
  requestInterface,
  NextApiResponse<UserSuccessResponse>
>();

handler.use(auth).post(
  async (_req, _res, next) => {
    await connectDatabase();
    next();
  },
  passport.authenticate("local"),
  (req, res) => res.json({ user: safeUserTransformator(req.user?.toObject()) })
);

export default handler;

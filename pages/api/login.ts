import nextConnect from "next-connect";
import auth from "@/middleware/auth";
import passport from "@/lib/passport";
import { connectDatabase } from "@/lib/db";
import { safeUserTransformator } from "@/lib/valueTransformator";

import type { NextApiRequest, NextApiResponse } from "next";

interface requestInterface extends NextApiRequest {
  logIn: logInType;
  user: any;
}

const handler = nextConnect<
  requestInterface,
  NextApiResponse<UserSuccessResponse | { user: null } | AlertErrorResponse>
>();

handler.use(auth).post(
  async (_req, _res, next) => {
    await connectDatabase();
    next();
  },
  (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) throw new Error(err);

      if (info)
        return res.status(info.status).send({ alert: true, error: info.error });
      if (!user) return res.status(401).send({ user: null });

      req.logIn(user, (error: any) => {
        if (error) throw new Error(error);
        next();
      });
    })(req, res, next);
  },
  (req, res) => {
    res.json({ user: safeUserTransformator(req.user?.toObject()) });
  }
);

export default handler;

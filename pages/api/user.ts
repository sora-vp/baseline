import nextConnect from "next-connect";
import auth from "@/middleware/auth";
import { safeUserTransformator } from "@/lib/valueTransformator";

// import User from "@/lib/User";

import type { NextApiRequest, NextApiResponse } from "next";

interface requestInterface extends NextApiRequest {
  user: any;
  logOut: () => void;
}

const handler = nextConnect<
  requestInterface,
  NextApiResponse<AlertErrorResponse | UserSuccessResponse | ApiErrorInterface>
>();

handler
  .use(auth)
  .get((req, res) => {
    res.json({
      user: req.user ? safeUserTransformator(req.user?.toObject()) : null,
    });
  })
  .use((req, res, next) => {
    if (!req.user)
      res.status(401).send({
        error: true,
        message: "Anda belum terautentikasi!",
        type: "UNAUTHENTICATED",
      });
    else next();
  })
  // .put((req, res) => {
  //   const { name } = req.body;
  //   const user = updateUserByUsername(req, req.user.username, { name });
  //   res.json({ user });
  // })
  .delete((req, res) => {
    req.logOut();
    res.status(204).end();
  });

export default handler;

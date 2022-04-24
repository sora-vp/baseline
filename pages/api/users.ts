import nextConnect from "next-connect";
import auth from "@/middleware/auth";
import { validateCsrf } from "@/lib/csrf";
import { connectDatabase } from "@/lib/db";
import { safeUserTransformator } from "@/lib/valueTransformator";

import User from "@/models/User";

import type { NextApiRequest, NextApiResponse } from "next";

interface requestInterface extends NextApiRequest {
  logIn: logInType;
}

const handler = nextConnect<
  requestInterface,
  NextApiResponse<AlertErrorResponse | UserSuccessResponse>
>();

handler
  .use(auth)
  .use(validateCsrf)
  .post(async (req, res) => {
    await connectDatabase();

    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).send({
        alert: true,
        error: {
          typeStatus: "warning",
          title: "Pemberitahuan",
          description: "Isi lengkap semua bidang yang telah dibutuhkan!",
        },
      });
    }

    const isUserExist = await User.getUserByEmail(email);

    if (isUserExist) {
      return res.status(409).send({
        alert: true,
        error: {
          typeStatus: "error",
          title: "Pemberitahuan",
          description: "Akun dengan email yang sama telah terdaftar!",
        },
      });
    }

    const newUser = await User.createNewUser({
      email,
      username: name,
      password,
    });

    req.logIn(newUser, (err: any) => {
      if (err) throw err;

      res.status(201).json({
        user: safeUserTransformator(newUser),
      });
    });
  });

export default handler;

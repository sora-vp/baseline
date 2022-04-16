import bcrypt from "bcrypt";
import nextConnect from "next-connect";
import auth from "@/middleware/auth";
import { connectDatabase } from "@/lib/db";

import User from "@/models/User";

import type { NextApiRequest, NextApiResponse } from "next";

const handler = nextConnect<
  NextApiRequest,
  NextApiResponse<AlertErrorResponse>
>();

handler.use(auth).post(async (req, res) => {
  console.log(await connectDatabase());

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

  const isUserExist = await User.findOne({ email });

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

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  const newUser = new User({
    email,
    username: name,
    password: hash,
  });

  await newUser.save();

  req.logIn(newUser, (err) => {
    if (err) throw err;

    res.status(201).json({
      user: newUser,
    });
  });
});

export default handler;

import bcrypt from "bcrypt";
import nextConnect from "next-connect";
import auth from "@/middleware/auth";
import { validateCsrf } from "@/lib/csrf";
import { safeUserTransformator } from "@/lib/valueTransformator";

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
  .use(validateCsrf)
  .put(async (req, res) => {
    const { type, body } = req.body;

    if (!type || !body)
      return res
        .status(400)
        .json({ error: true, message: "Tidak ada type ataupun body!" });

    switch (type) {
      case "UPDATE_USERNAME":
        const { nama } = body;

        if (!nama)
          return res.status(400).json({
            error: true,
            message: "Diperlukan nama yang ingin diubah!",
          });

        try {
          await req.user.updateOne({ username: nama });

          res
            .status(201)
            .json({ error: false, message: "Nama berhasil diperbarui!" });
        } catch (e: unknown) {
          res.status(500).json({
            error: true,
            message: (e as unknown as { toString(): string }).toString(),
          });
        }

        break;

      case "UPDATE_PASSWORD":
        const { lama, baru } = body;

        if (!lama || !baru)
          return res.status(400).json({
            error: true,
            message: "Diperlukan password lama dan yang baru!",
          });

        bcrypt.compare(lama, req.user.password, async (err, isMatch) => {
          if (err)
            res.status(500).json({
              error: true,
              message: (err as unknown as { toString(): string }).toString(),
            });

          if (!isMatch)
            return res
              .status(400)
              .json({ error: true, message: "Password lama salah!" });

          const salt = bcrypt.genSaltSync(10);
          const hash = bcrypt.hashSync(baru, salt);

          try {
            await req.user.updateOne({ password: hash });

            res
              .status(201)
              .json({ error: false, message: "Password berhasil diperbarui!" });
          } catch (e: unknown) {
            res.status(500).json({
              error: true,
              message: (e as unknown as { toString(): string }).toString(),
            });
          }
        });

        break;
      default:
        return res
          .status(400)
          .json({ error: true, message: "Invalid request" });
    }
  })
  .delete((req, res) => {
    req.logOut();
    res.status(200).json({ error: false, message: "Berhasil logout" });
  });

export default handler;

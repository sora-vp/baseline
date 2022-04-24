import { Types } from "mongoose";
import nextConnect from "next-connect";
import { connectDatabase } from "@/lib/db";
import {
  safePaslonTransformator,
  type SafePaslonTransformatorInterface,
} from "@/lib/valueTransformator";
import { validateCsrf } from "@/lib/csrf";

import Paslon from "@/models/Paslon";

import type { NextApiRequest, NextApiResponse } from "next";

const handler = nextConnect<
  NextApiRequest,
  NextApiResponse<
    { paslon: SafePaslonTransformatorInterface[] | null } | ApiErrorInterface
  >
>();

handler
  .use(async (_req, _res, next) => {
    await connectDatabase();
    next();
  })
  .get(async (_req, res) => {
    const paslon = await Paslon.find({}).lean();

    res.json({
      paslon: paslon.length > 0 ? safePaslonTransformator(paslon) : null,
    });
  })
  .use(validateCsrf)
  .post(async (req, res) => {
    const { id } = req.body;

    if (!id)
      return res.status(400).json({
        error: true,
        message: "Anda harus menambahkan id untuk memilih",
      });

    if (Types.ObjectId.isValid(id)) {
      const paslon = await Paslon.findById(id);

      if (!paslon)
        return res
          .status(404)
          .json({ error: true, message: "Paslon tidak ditemukan !" });
      await Paslon.upvote(id);

      res
        .status(200)
        .json({ error: false, message: "Paslon berhasil terpilih" });
    } else {
      res
        .status(400)
        .json({ error: true, message: "Parameter body tidak valid !" });
    }
  });

export default handler;

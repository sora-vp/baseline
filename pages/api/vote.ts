import { DateTime } from "luxon";
import { Types } from "mongoose";
import nextConnect from "next-connect";
import { connectDatabase } from "@/lib/db";
import {
  safePaslonTransformator,
  type SafePaslonTransformatorInterface,
} from "@/lib/valueTransformator";
import { validateCsrf } from "@/lib/csrf";
import settingsLib from "@/lib/settings";
import auth from "@/middleware/auth";

import Paslon from "@/models/Paslon";

import type { NextApiRequest, NextApiResponse } from "next";

const handler = nextConnect<
  NextApiRequest & { user: any },
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
  .use(auth)
  .use(async (req, res, next) => {
    if (req.user)
      res.status(401).json({
        error: true,
        message: "Anda sudah terautentikasi!",
      });
    else next();
  })
  .use(validateCsrf)
  .post(async (req, res) => {
    const { id, timeZone } = req.body;

    if (!id || !timeZone)
      return res.status(400).json({
        error: true,
        message: "Anda harus mengirimkan id dan zona waktu untuk memilih!",
      });

    if (!DateTime.now().setZone(timeZone).isValid)
      return res.status(400).json({
        error: true,
        message: "Zona waktu tidak valid!",
      });

    if (Types.ObjectId.isValid(id)) {
      const settings = await settingsLib.read();

      const currentTime = DateTime.now().setZone(timeZone).toJSDate().getTime();
      const timeConfig = {
        mulai: settings?.startTime
          ? DateTime.fromISO(settings?.startTime as unknown as string)
              .setZone(timeZone)
              .toJSDate()
              .getTime()
          : false,
        selesai: settings?.endTime
          ? DateTime.fromISO(settings?.endTime as unknown as string)
              .setZone(timeZone)
              .toJSDate()
              .getTime()
          : false,
      };

      const canVoteNow =
        timeConfig?.mulai <= currentTime &&
        timeConfig?.selesai >= currentTime &&
        settings?.canVote !== null &&
        settings?.canVote !== false;

      if (!canVoteNow)
        return res.status(400).json({
          error: true,
          message: "Belum bisa memilih untuk saat ini!",
        });

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

import fs from "fs";
import mv from "mv";
import path from "path";
import fsp from "fs/promises";
import { DateTime } from "luxon";
import { Types } from "mongoose";
import formidable from "formidable";
import nextConnect from "next-connect";

import auth from "@/middleware/auth";
import Paslon from "@/models/Paslon";
import settingsLib from "@/lib/settings";
import { validateCsrf } from "@/lib/csrf";
import { connectDatabase } from "@/lib/db";

import type { IPaslon } from "@/models/Paslon";

import type { NextApiRequest, NextApiResponse } from "next";

const handler = nextConnect<
  { user: any } & NextApiRequest,
  NextApiResponse<ApiErrorInterface | { paslon: IPaslon[] | null }>
>();

type grabableImageType = {
  newFilename: string;
  originalFilename: string;
  filepath: string;
};

const ROOT_PATH = path.join(path.resolve(), "public/uploads");

const canVoteNow = async (timeZone: string) => {
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

  return (
    timeConfig?.mulai <= currentTime &&
    timeConfig?.selesai >= currentTime &&
    settings?.canVote !== null &&
    settings?.canVote !== false
  );
};

handler
  .use(auth)
  .use(async (req, res, next) => {
    await connectDatabase();

    if (!req.user)
      res.status(401).json({
        error: true,
        message: "Anda belum terautentikasi!",
        type: "UNAUTHENTICATED",
      });
    else next();
  })
  .get(async (req, res) => {
    const paslon = await Paslon.find({}).lean();

    res.json({
      paslon: paslon.length > 0 ? paslon : null,
    });
  })
  .use(validateCsrf)
  .post((req, res) => {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      const { ketua, wakil, timeZone } = fields as {
        ketua: string;
        wakil: string;
        timeZone: string;
      };

      if (!ketua || !wakil || !files.image || !timeZone)
        return res.status(400).json({
          error: true,
          message: "Diperlukan nama ketua, wakil, gambar, dan zona waktu!",
        });

      if (!DateTime.now().setZone(timeZone).isValid) {
        return res.status(400).json({
          error: true,
          message: "Zona waktu tidak valid!",
        });
      }

      const inVoteCondition = await canVoteNow(timeZone);

      if (inVoteCondition)
        return res.status(400).json({
          error: true,
          message: "Tidak bisa menambahkan paslon pada saat kondisi pemilihan",
        });

      const image = files.image as unknown as grabableImageType;

      const splitted = image.originalFilename.split(".");
      const ext = splitted[splitted.length - 1];
      const newName = `${image.newFilename}.${ext}`;

      const newPath = path.join(ROOT_PATH, newName);

      mv(image.filepath, newPath, { mkdirp: true }, (err) => {
        if (err)
          return res
            .status(500)
            .json({ error: true, message: "Gagal mengupload gambar baru" });
      });

      try {
        const newPaslon = new Paslon({
          ketua,
          wakil,
          imgName: newName,
        });

        await newPaslon.save();

        res
          .status(200)
          .json({ error: false, message: "Paslon berhasil dibuat" });
      } catch (e: unknown) {
        res.status(500).json({
          error: true,
          message: (e as unknown as { toString(): string }).toString(),
        });
      }
    });
  })
  .put((req, res) => {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      const { ketua, wakil, timeZone, id } = fields as unknown as {
        ketua: string;
        wakil: string;
        timeZone: string;
        id: Types.ObjectId;
      };

      if (!id || !ketua || !wakil || !timeZone)
        return res.status(400).json({
          error: true,
          message: "Diperlukan id paslon, ketua, wakil, dan zona waktu!",
        });

      if (!Types.ObjectId.isValid(id))
        return res
          .status(400)
          .json({ error: true, message: "Parameter id paslon tidak valid!" });

      if (!DateTime.now().setZone(timeZone).isValid) {
        return res.status(400).json({
          error: true,
          message: "Zona waktu tidak valid!",
        });
      }

      const inVoteCondition = await canVoteNow(timeZone);

      if (inVoteCondition)
        return res.status(400).json({
          error: true,
          message: "Tidak bisa mengubah paslon pada saat kondisi pemilihan",
        });

      try {
        const paslon = await Paslon.findById(id);

        if (!paslon)
          return res
            .status(404)
            .json({ error: true, message: "Paslon tidak ditemukan!" });

        const image = files.image as unknown as grabableImageType;

        const splitted = image && image.originalFilename.split(".");
        const ext = image && splitted[splitted.length - 1];
        const newName = image && `${image.newFilename}.${ext}`;

        if (image) {
          const oldImagePath = path.join(ROOT_PATH, paslon.imgName);
          if (fs.existsSync(oldImagePath)) await fsp.unlink(oldImagePath);

          const newPath = image && path.join(ROOT_PATH, newName);

          mv(image.filepath, newPath, { mkdirp: true }, (err) => {
            if (err)
              return res
                .status(500)
                .json({ error: true, message: "Gagal mengupload gambar baru" });
          });
        }

        await paslon.update({
          ketua,
          wakil,
          imgName: image ? newName : paslon.imgName,
        });

        res.status(200).json({
          error: false,
          message: "Berhasil mengedit paslon!",
        });
      } catch (e: unknown) {
        res.status(500).json({
          error: true,
          message: (e as unknown as { toString(): string }).toString(),
        });
      }
    });
  })
  .delete((req, res) => {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields) => {
      const { id, timeZone } = fields as unknown as {
        id: Types.ObjectId;
        timeZone: string;
      };

      if (!id || !timeZone)
        return res.status(400).json({
          error: true,
          message: "Diperlukan id paslon dan zona waktu!",
        });

      if (!DateTime.now().setZone(timeZone).isValid) {
        return res.status(400).json({
          error: true,
          message: "Zona waktu tidak valid!",
        });
      }

      const inVoteCondition = await canVoteNow(timeZone);

      if (inVoteCondition)
        return res.status(400).json({
          error: true,
          message: "Tidak bisa menghapus paslon pada saat kondisi pemilihan",
        });

      if (Types.ObjectId.isValid(id as unknown as string)) {
        const paslon = await Paslon.findById(id);

        if (!paslon)
          return res
            .status(404)
            .json({ error: true, message: "Paslon tidak ditemukan !" });

        const imagePath = path.join(ROOT_PATH, paslon.imgName);

        // gon
        if (fs.existsSync(imagePath)) await fsp.unlink(imagePath);
        await paslon.remove();

        res
          .status(200)
          .json({ error: false, message: "Paslon berhasil dihapus!" });
      } else {
        res
          .status(400)
          .json({ error: true, message: "Parameter body tidak valid !" });
      }
    });
  });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;

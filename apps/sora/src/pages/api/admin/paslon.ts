import fs from "fs";
import mv from "mv";
import path from "path";
import fsp from "fs/promises";
import { DateTime } from "luxon";
import { Types } from "mongoose";
import formidable from "formidable";
import nextConnect from "next-connect";

import { PaslonModel } from "../../../models";
import { canVoteNow } from "../../../utils/canVote";

import { connectDatabase } from "../../../utils/database";
import { getServerAuthSession } from "../../../server/common/get-server-auth-session";

import type { NextApiRequest, NextApiResponse } from "next";

type grabableImageType = {
  newFilename: string;
  originalFilename: string;
  filepath: string;
};

const ROOT_PATH = path.join(path.resolve(), "public/uploads");
const handler = nextConnect<
  NextApiRequest & { cookies: Partial<{ [key: string]: string }> },
  NextApiResponse
>();

handler
  .use(async (req, res, next) => {
    await connectDatabase();
    next();
  })
  .use(async (req, res, next) => {
    const session = await getServerAuthSession({ req, res });

    if (!session)
      res.status(401).json({
        error: true,
        message: "Anda belum terautentikasi!",
        type: "UNAUTHENTICATED",
      });
    else next();
  })
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
        const newPaslon = new PaslonModel({
          namaKetua: ketua,
          namaWakil: wakil,
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
        const paslon = await PaslonModel.findById(id);

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

        await paslon.updateOne({
          namaKetua: ketua,
          namaWakil: wakil,
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
  });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;

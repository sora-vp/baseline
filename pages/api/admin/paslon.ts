import fs from "fs";
import mv from "mv";
import path from "path";
import fsp from "fs/promises";
import { Types } from "mongoose";
import formidable from "formidable";
import nextConnect from "next-connect";

import auth from "@/middleware/auth";
import Paslon from "@/models/Paslon";
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
  .post(async (req, res) => {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      const { ketua, wakil } = fields;

      if (!ketua || !wakil || !files.image)
        return res.status(400).json({
          error: true,
          message: "Diperlukan nama ketua, wakil, dan gambarnya!",
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
  .delete(async (req, res) => {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields) => {
      const { id } = fields;

      if (!id)
        return res.status(400).json({
          error: true,
          message: "Diperlukan id paslon!",
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

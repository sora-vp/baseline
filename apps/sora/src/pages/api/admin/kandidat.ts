import fs from "fs";
import mv from "mv";
import path from "path";
import fsp from "fs/promises";
import { DateTime } from "luxon";
import { Types } from "mongoose";
import formidable from "formidable";
import nextConnect from "next-connect";

import { KandidatModel } from "@models/index";
import { canVoteNow } from "@utils/canVote";

import { connectDatabase } from "@utils/database";
import { getServerAuthSession } from "@server/common/get-server-auth-session";

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
      const { kandidat, timeZone } = fields as {
        kandidat: string;
        timeZone: string;
      };

      if (!kandidat || !files.image || !timeZone)
        return res.status(400).json({
          error: true,
          message: "Diperlukan nama kandidat, gambar, dan zona waktu!",
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
          message:
            "Tidak bisa menambahkan kandidat pada saat kondisi pemilihan",
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
        const newCandidate = new KandidatModel({
          namaKandidat: kandidat,
          imgName: newName,
        });

        await newCandidate.save();

        res
          .status(200)
          .json({ error: false, message: "Kandidat berhasil dibuat" });
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
      const { kandidat, timeZone, id } = fields as unknown as {
        kandidat: string;
        timeZone: string;
        id: Types.ObjectId;
      };

      if (!id || !kandidat || !timeZone)
        return res.status(400).json({
          error: true,
          message: "Diperlukan id, nama kandidat, dan zona waktu!",
        });

      if (!Types.ObjectId.isValid(id))
        return res
          .status(400)
          .json({ error: true, message: "Parameter id kandidat tidak valid!" });

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
          message: "Tidak bisa mengubah kandidat pada saat kondisi pemilihan",
        });

      try {
        const kandidat = await KandidatModel.findById(id);

        if (!kandidat)
          return res
            .status(404)
            .json({ error: true, message: "Kandidat tidak ditemukan!" });

        const image = files.image as unknown as grabableImageType;

        const splitted = image && image.originalFilename.split(".");
        const ext = image && splitted[splitted.length - 1];
        const newName = image && `${image.newFilename}.${ext}`;

        if (image) {
          const oldImagePath = path.join(ROOT_PATH, kandidat.imgName);
          if (fs.existsSync(oldImagePath)) await fsp.unlink(oldImagePath);

          const newPath = image && path.join(ROOT_PATH, newName);

          mv(image.filepath, newPath, { mkdirp: true }, (err) => {
            if (err)
              return res
                .status(500)
                .json({ error: true, message: "Gagal mengupload gambar baru" });
          });
        }

        await kandidat.updateOne({
          namaKandidat: kandidat,
          imgName: image ? newName : kandidat.imgName,
        });

        res.status(200).json({
          error: false,
          message: "Berhasil mengedit kandidat!",
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

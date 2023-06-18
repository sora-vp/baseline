import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import mv from "mv";
import { createRouter } from "next-connect";

import { getServerSession } from "@sora/auth";
import { prisma } from "@sora/db";
import { canVoteNow } from "@sora/settings";

type grabableImageType = {
  newFilename: string;
  originalFilename: string;
  filepath: string;
};

const ROOT_PATH = path.join(path.resolve(), "public/uploads");

const router = createRouter<NextApiRequest, NextApiResponse>()
  .use(async (req, res, next) => {
    const session = await getServerSession({ req, res });

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
      const { kandidat } = fields as {
        kandidat: string;
      };

      if (!kandidat || !files.image)
        return res.status(400).json({
          error: true,
          message: "Diperlukan nama kandidat dan gambarnya!",
        });

      const inVoteCondition = canVoteNow();

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
        await prisma.candidate.create({
          data: {
            name: kandidat,
            img: newName,
          },
        });

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
      const { kandidat, id } = fields as unknown as {
        kandidat: string;
        id: string;
      };

      if (!id || !kandidat)
        return res.status(400).json({
          error: true,
          message: "Diperlukan id dan nama kandidat!",
        });

      if (isNaN(parseInt(id)))
        return res.status(400).json({
          error: true,
          message: "id tidak valid!",
        });

      const inVoteCondition = canVoteNow();

      if (inVoteCondition)
        return res.status(400).json({
          error: true,
          message: "Tidak bisa mengubah kandidat pada saat kondisi pemilihan",
        });

      try {
        const candidate = await prisma.candidate.findUnique({
          where: { id: parseInt(id) },
        });

        if (!candidate)
          return res
            .status(404)
            .json({ error: true, message: "Kandidat tidak ditemukan!" });

        const image = files.image as unknown as grabableImageType;

        const splitted = image && image.originalFilename.split(".");
        const ext = image && splitted[splitted.length - 1];
        const newName = image && `${image.newFilename}.${ext}`;

        if (image) {
          const oldImagePath = path.join(ROOT_PATH, candidate.img);
          if (fs.existsSync(oldImagePath)) await fsp.unlink(oldImagePath);

          const newPath = image && path.join(ROOT_PATH, newName);

          mv(image.filepath, newPath, { mkdirp: true }, (err) => {
            if (err)
              return res
                .status(500)
                .json({ error: true, message: "Gagal mengupload gambar baru" });
          });
        }

        await prisma.candidate.update({
          where: { id: parseInt(id) },
          data: {
            name: kandidat,
            img: image ? newName : candidate.img,
          },
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

export default router.handler();

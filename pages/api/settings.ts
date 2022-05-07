import nextConnect from "next-connect";

import auth from "@/middleware/auth";
import { validateCsrf } from "@/lib/csrf";
import { connectDatabase } from "@/lib/db";
import settings, {
  type TModelApiResponse,
  type DataModel,
} from "@/lib/settings";

import type { NextApiRequest, NextApiResponse } from "next";

const handler = nextConnect<
  { user: any } & NextApiRequest,
  NextApiResponse<ApiErrorInterface | TModelApiResponse>
>();

handler
  .get(async (req, res) => {
    const data = await settings.read();

    res.status(200).json({
      startTime: data?.startTime ? data.startTime : null,
      endTime: data?.endTime ? data.endTime : null,
      canVote: data?.canVote !== undefined ? data.canVote : false,
      reloadAfterVote:
        data?.reloadAfterVote !== undefined ? data.reloadAfterVote : false,
    });
  })
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
  .use(validateCsrf)
  .put(async (req, res) => {
    const readedData = await settings.read();
    const { type, body } = req.body;

    if (!type || !body)
      return res
        .status(400)
        .json({ error: true, message: "Tidak ada type ataupun body!" });

    switch (type) {
      case "UPDATE_TIME":
        const { mulai, selesai } = body as unknown as {
          mulai: Date;
          selesai: Date;
        };

        if (!mulai || !selesai)
          return res.status(400).json({
            error: true,
            message: "Diperlukan waktu mulai dan waktu selesai pemilihan!",
          });

        await settings.write({
          ...(readedData as unknown as DataModel),
          startTime: mulai,
          endTime: selesai,
        });

        res.status(200).json({
          error: false,
          message: "Pengaturan waktu pemilihan berhasil diperbarui!",
        });
        break;

      case "UPDATE_BEHAVIOUR":
        const { canVote, reloadAfterVote } = body as unknown as DataModel;

        if (
          canVote === undefined ||
          canVote === null ||
          reloadAfterVote === undefined ||
          reloadAfterVote === null
        )
          return res.status(400).json({
            error: true,
            message:
              "Diperlukan konfigurasi apakah sudah bisa memilih dan refresh halaman setelah memilih!",
          });

        await settings.write({
          ...(readedData as unknown as DataModel),
          canVote,
          reloadAfterVote,
        });

        res.status(200).json({
          error: false,
          message: "Pengaturan perilaku pemilihan berhasil diperbarui!",
        });
        break;
      default:
        return res
          .status(400)
          .json({ error: true, message: "Invalid request" });
    }
  });

export default handler;

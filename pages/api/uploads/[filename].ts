import fs from "fs";
import path from "path";
import mime from "mime-types";

import type { NextApiRequest, NextApiResponse } from "next";

const ROOT_PATH = path.join(path.resolve(), "public/uploads");

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { filename } = req.query as unknown as { filename: string };

  const safeSuffix = path.normalize(filename).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = path.join(ROOT_PATH, safeSuffix);

  if (!fs.existsSync(filePath))
    return res.status(404).json({ error: true, message: "Not Found" });

  const image = fs.readFileSync(filePath);
  const contentType = mime.lookup(filePath);

  res
    .setHeader("Content-Type", contentType as string)
    .status(200)
    .send(image);
}

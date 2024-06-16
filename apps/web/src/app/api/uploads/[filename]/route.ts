import fs from "fs";
import path from "path";
import mime from "mime-types";

const ROOT_PATH = path.join(path.resolve(), "public/uploads");

export function GET(
  request: Request,
  { params }: { params: { filename: string } },
) {
  const filename = params.filename;

  const safeSuffix = path.normalize(filename).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = path.join(ROOT_PATH, safeSuffix);

  if (!fs.existsSync(filePath))
    return Response.json({ message: "Image not found!" }, { status: 404 });

  const image = fs.readFileSync(filePath);
  const contentType = mime.lookup(filePath);

  return new Response(image, {
    headers: { "Content-Type": contentType as string },
  });
}

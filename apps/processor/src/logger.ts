import path from "path";
import { fileURLToPath } from "url";
import pino from "pino";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const logger = pino({
  transport: {
    targets: [
      {
        target: "pino-pretty",
        level: "debug",
        options: {
          colorize: true,
          ignore: "pid,hostname",
          translateTime: "SYS:standard",
        },
      },
      {
        target: "pino/file",
        level: "debug",
        options: {
          destination: path.join(__dirname, "..", "processor.log"),
        },
      },
    ],
  },
});

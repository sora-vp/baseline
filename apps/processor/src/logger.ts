import path from "path";
import pino from "pino";

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

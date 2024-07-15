import path from "path";
import pino from "pino";

export const initLogger = (destinationDirectoryPath: string) =>
  pino({
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
            destination: path.join(destinationDirectoryPath, "processor.log"),
          },
        },
      ],
    },
  });

import type { AlertStatus } from "@chakra-ui/react";

export {};

interface AlertErrorInterface {
  typeStatus: AlertStatus;
  title: string;
  description: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TOKEN_SECRET: string;
      MONGO_URL: string;
      TOKEN_SECRET: string;
    }
  }

  interface AlertState {
    show: boolean;
    typeStatus: string;
    title: string;
    description: string;
  }

  interface AlertErrorResponse {
    alert: boolean;
    error: AlertErrorInterface;
  }
}

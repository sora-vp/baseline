import type { AlertStatus } from "@chakra-ui/react";
import type { safeUserTransformatorInterface } from "@/lib/valueTransformator";

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

  interface UserSuccessResponse {
    user: safeUserTransformatorInterface | null;
  }

  type logInType = (user: any, done: (error: any) => void) => void;

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

  interface ApiErrorInterface {
    error: boolean;
    message: string;
    type?: "UNAUTHENTICATED";
  }
}

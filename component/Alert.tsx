import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import type { AlertStatus } from "@chakra-ui/react";

export interface AlertInterface {
  status: AlertStatus;
  title: string;
  description: string;
}

export default function AlertSet({
  status,
  title,
  description,
}: AlertInterface) {
  return (
    <Alert status={status}>
      <AlertIcon />
      <AlertTitle mr={2}>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}

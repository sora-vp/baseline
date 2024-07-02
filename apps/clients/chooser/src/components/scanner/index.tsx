import { useCallback, useState } from "react";
import { useParticipant } from "@/context/participant-context";
import { api } from "@/utils/api";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";

import { Button } from "@sora-vp/ui/button";
import { Separator } from "@sora-vp/ui/separator";

import { UniversalError } from "../universal-error";
import { UniversalLoading } from "../universal-loading";
import { MainScanner } from "./main-scanner";

export function ScannerComponent() {
  const { qrId, setQRCode } = useParticipant();

  const [isQrInvalid, setInvalidQr] = useState(false);

  const participantAttended =
    api.clientConsumer.checkParticipantAttended.useMutation({
      onSuccess() {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        setQRCode(participantAttended.variables!);
      },
    });

  const setIsQrValid = useCallback(
    (invalid: boolean) => setInvalidQr(invalid),
    [],
  );
  const mutateData = useCallback(
    (qrId: string) => participantAttended.mutate(qrId),
    [participantAttended],
  );

  if (qrId) return <Navigate to="/vote" />;

  if (participantAttended.isPending)
    return (
      <UniversalLoading
        title="Mengambil data status anda..."
        description="Mohon tunggu, selanjutnya anda dapat memilih."
      />
    );

  if (isQrInvalid || participantAttended.isError)
    return (
      <UniversalError
        title="Gagal Verifikasi Status!"
        description={
          participantAttended.isError
            ? participantAttended.error.message
            : "QR Code yang anda tunjukkan tidak valid. Beritahu panitia untuk memperbaiki masalah ini."
        }
      />
    );

  return <MainScanner mutateData={mutateData} setInvalidQr={setIsQrValid} />;
}

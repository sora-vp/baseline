import { useCallback, useEffect, useState } from "react";
import { useKeyboardWebsocket } from "@/context/keyboard-websocket";
import { useParticipant } from "@/context/participant-context";
import { api } from "@/utils/api";
import { Navigate } from "react-router-dom";

import { UniversalError } from "../universal-error";
import { UniversalLoading } from "../universal-loading";
import { MainScanner } from "./main-scanner";

export function ScannerComponent() {
  const { qrId, setQRCode } = useParticipant();
  const { wsEnabled, lastMessage, setLastMessage } = useKeyboardWebsocket();

  const [isQrInvalid, setInvalidQr] = useState(false);

  const participantAttended =
    api.clientConsumer.checkParticipantAttended.useMutation({
      onSuccess() {
        setLastMessage(null);

        setQRCode(participantAttended.variables!);
      },
    });

  useEffect(() => {
    if (wsEnabled && lastMessage) {
      // Precheck before consuming command
      if (lastMessage.startsWith("SORA-KEYBIND-")) {
        const actualCommand = lastMessage.replace("SORA-KEYBIND-", "");

        switch (actualCommand) {
          case "RELOAD": {
            if (isQrInvalid || participantAttended.isError) location.reload();

            break;
          }
        }
      }
    }
  }, [isQrInvalid, participantAttended.isError, wsEnabled, lastMessage]);

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

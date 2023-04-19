import { useState, useCallback } from "react";

import { trpc } from "@renderer/utils/trpc";
import { useParticipant } from "@renderer/context/ParticipantContext";

import UniversalErrorHandler from "../UniversalErrorHandler";
import NormalScanner from "./NormalScanner";
import Loading from "../Loading";

import { Navigate } from "react-router-dom";

const Scanner: React.FC = () => {
  const { qrId, setQRCode } = useParticipant();

  const [isQrInvalid, setInvalidQr] = useState<boolean>(false);

  const checkParticipantMutation =
    trpc.participant.isParticipantAlreadyAttended.useMutation({
      onSuccess() {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        setQRCode(checkParticipantMutation.variables!);
      },
    });

  const setIsQrValid = useCallback(
    (invalid: boolean) => setInvalidQr(invalid),
    []
  );

  if (qrId) return <Navigate to="/vote" />;

  if (checkParticipantMutation.isLoading)
    return <Loading headingText="Mengecek status anda..." />;

  if (isQrInvalid || checkParticipantMutation.isError)
    return (
      <UniversalErrorHandler
        title="Gagal Verifikasi!"
        message={
          checkParticipantMutation.isError
            ? checkParticipantMutation.error.message
            : "QR Code yang anda tunjukkan tidak valid. Beritahu panitia untuk memperbaiki masalah ini."
        }
      />
    );
  return (
    <NormalScanner
      checkParticipantMutation={checkParticipantMutation}
      setInvalidQr={setIsQrValid}
    />
  );
};

export default Scanner;

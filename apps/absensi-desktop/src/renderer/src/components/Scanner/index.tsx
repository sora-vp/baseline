import { useState, useCallback } from "react";

import ScanningError from "./ScanningError";
import NormalScanner from "./NormalScanner";

import SuccessScan from "./SuccessScan";

import { trpc } from "@renderer/utils/trpc";

const Scanner: React.FC = () => {
  const [isQrInvalid, setInvalidQr] = useState<boolean>(false);

  const participantAttend = trpc.participant.participantAttend.useMutation();

  const setIsQrValid = useCallback(
    (invalid: boolean) => setInvalidQr(invalid),
    []
  );

  if (participantAttend.isSuccess)
    return <SuccessScan participantAttend={participantAttend} />;

  if (isQrInvalid || participantAttend.isError) return <ScanningError message={participantAttend.isError ? participantAttend.error.message : "QR Code yang anda tunjukkan tidak valid. Beritahu panitia untuk memperbaiki masalah ini."} />

  return <NormalScanner participantAttend={participantAttend} setInvalidQr={setIsQrValid} />;
};

export default Scanner;

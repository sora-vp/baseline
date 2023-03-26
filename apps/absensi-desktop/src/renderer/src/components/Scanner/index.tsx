import { useState, useCallback } from "react";

import IsMutationError from "./IsMutationError";
import InvalidScanner from "./InvalidScanner";
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

  if (participantAttend.isError) return <IsMutationError message={participantAttend.error.message} />

  if (isQrInvalid) return <InvalidScanner setInvalidQr={setIsQrValid} />;

  return <NormalScanner participantAttend={participantAttend} setInvalidQr={setIsQrValid} />;
};

export default Scanner;

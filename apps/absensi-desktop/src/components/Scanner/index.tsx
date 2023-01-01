import { useState, useCallback } from "react";

import InvalidScanner from "./InvalidScanner";
import NormalScanner from "./NormalScanner";

const Scanner: React.FC = () => {
  const [isQrInvalid, setInvalidQr] = useState<boolean>(false);

  const setIsQrValid = useCallback(
    (invalid: boolean) => setInvalidQr(invalid),
    []
  );

  if (isQrInvalid) return <InvalidScanner setInvalidQr={setIsQrValid} />;
  return <NormalScanner setInvalidQr={setIsQrValid} />;
};

export default Scanner;

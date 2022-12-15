import QrScanner from "qr-scanner";
import { useEffect, useRef } from "react";

import { soraTRPC } from "@/utils/trpc";

const arrayValidator = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const validateInput = (input: string) =>
  input
    .split("")
    .map((char) => arrayValidator.includes(char))
    .every((item) => item === true);

const App: React.FC = () => {
  const hello = soraTRPC.settings.getSettings.useQuery();

  const videoRef = useRef<HTMLVideoElement>(null!);

  useEffect(() => {
    const qrScanner = new QrScanner(videoRef.current, (result) => {
      qrScanner.stop();

      const isValid = validateInput(result);

      console.log(isValid);
    });

    qrScanner.start();

    return () => {
      qrScanner.destroy();
    };
  }, []);

  return (
    <section
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <article
        className="card"
        style={{
          width: "75%",
          height: "90%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            height: "100%",
            width: "80%",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <div style={{ height: "85%" }}>
            <video ref={videoRef}></video>
          </div>
          <div style={{ height: "auto" }}>
            <h3>Scan Barcode ID Mu!</h3>
          </div>
        </div>
      </article>
    </section>
  );
};

export default App;

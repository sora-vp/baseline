import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import QrScanner from "qr-scanner";

import { validateId } from "@sora-vp/id-generator";
import { toast } from "@sora-vp/ui/toast";

export function MainScanner({
  setInvalidQr,
  mutateData,
}: {
  setInvalidQr: (invalid: boolean) => void;
  mutateData: (qrId: string) => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const videoRef = useRef<HTMLVideoElement>(null!);

  useEffect(() => {
    const qrScanner = new QrScanner(
      videoRef.current,
      ({ data }) => {
        if (data || data !== "") {
          qrScanner.stop();

          const isValidQr = validateId(data);

          if (!isValidQr) return setInvalidQr(true);

          mutateData(data);
        }
      },
      {
        highlightCodeOutline: true,
        highlightScanRegion: true,
        onDecodeError: (error) => {
          if (error instanceof Error)
            toast.error("Terjadi kegagalan dalam memindai gambar QR.", {
              description: `Error: ${error.message}`,
            });
        },
      },
    );

    qrScanner.start();

    return () => {
      qrScanner.destroy();
    };
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-5">
      <motion.h2
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: 200 }}
        transition={{
          duration: 0.3,
        }}
        className="scroll-m-20 text-3xl font-semibold tracking-tight"
      >
        Mohon arahkan QR ke kotak kuning
      </motion.h2>
      <motion.video
        exit={{ opacity: 0, x: 200 }}
        transition={{
          duration: 0.3,
          delay: 0.2,
        }}
        className="min-h-[30rem] w-[42rem] rounded-xl border bg-stone-200"
        ref={videoRef}
      />
    </div>
  );
}

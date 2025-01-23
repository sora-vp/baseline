import { useCallback, useState } from "react";
import { api } from "@/utils/api";
import { successTimeoutAtom } from "@/utils/atom";
import { useAtomValue } from "jotai";
import { Loader, RotateCcw } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@sora-vp/ui/button";
import { Separator } from "@sora-vp/ui/separator";

import { MainScanner } from "./main-scanner";

export function ScannerComponent() {
  const [isQrInvalid, setInvalidQr] = useState(false);
  const successTimeout = useAtomValue(successTimeoutAtom);

  const participantAttend = api.clientConsumer.participantAttend.useMutation({
    onSuccess() {
      setTimeout(() => participantAttend.reset(), successTimeout);
    },
  });

  const setIsQrValid = useCallback(
    (invalid: boolean) => setInvalidQr(invalid),
    [],
  );
  const mutateData = useCallback(
    (qrId: string) => participantAttend.mutate(qrId),
    [participantAttend],
  );

  if (participantAttend.isPending)
    return (
      <motion.div
        initial={{ opacity: 0, x: "-250px" }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: "-250px" }}
        className="flex h-screen w-screen flex-col items-center justify-center"
      >
        <Loader size={78} strokeWidth={1.5} className="animate-spin" />

        <div>
          <h3 className="mt-8 scroll-m-20 text-3xl font-semibold tracking-tight">
            Mengirim Data Kehadiran...
          </h3>
          <p className="text-xl font-light leading-7">
            Mohon tunggu proses ini sampai selesai.
          </p>
        </div>
      </motion.div>
    );

  if (participantAttend.isSuccess)
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-6 bg-green-600 p-6">
        <div className="w-[80%] text-center">
          <motion.h1
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            transition={{
              duration: 0.3,
            }}
            className="scroll-m-20 font-mono text-4xl font-extrabold tracking-tight text-red-100 lg:text-5xl"
          >
            Berhasil Mengisi Kehadiran!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            transition={{
              duration: 0.3,
              delay: 0.2,
            }}
            className="text-center text-xl leading-7 text-red-100/90 [&:not(:first-child)]:mt-4"
          >
            Silahkan menuju ke komputer pemilihan dan gunakan hak suara anda.
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -25 }}
          transition={{
            duration: 0.3,
            delay: 0.4,
          }}
          className="flex gap-3 rounded-lg border border-green-400 bg-green-400 p-4"
        >
          <div className="select-none">
            <pre className="mb-[-10px] font-mono">
              {participantAttend.data.qrId.slice(0, 5)}
            </pre>
            <pre className="font-mono">
              {participantAttend.data.qrId.slice(5, 10)}
            </pre>
            <pre className="mt-[-10px] font-mono">
              {participantAttend.data.qrId.slice(10, 15)}
            </pre>
          </div>
          <Separator orientation="vertical" className="bg-teal-600" />
          <div className="flex flex-col justify-center gap-2">
            <p className="text-2xl font-semibold leading-none">
              {participantAttend.data.name}
            </p>
            <span className="font-mono text-lg font-medium leading-none">
              {participantAttend.data.subpart}
            </span>
          </div>
        </motion.div>
      </div>
    );

  if (isQrInvalid || participantAttend.isError)
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-5 bg-red-600 p-6">
        <div className="w-[80%] text-center">
          <motion.h1
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 25 }}
            transition={{
              duration: 0.3,
            }}
            className="scroll-m-20 font-mono text-4xl font-extrabold tracking-tight text-red-100 lg:text-5xl"
          >
            Gagal Mengisi Kehadiran
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 25 }}
            transition={{
              duration: 0.3,
              delay: 0.2,
            }}
            className="text-center text-2xl leading-7 text-red-100 [&:not(:first-child)]:mt-6"
          >
            {participantAttend.isError
              ? participantAttend.error.message
              : "QR Code yang anda tunjukkan tidak valid. Beritahu panitia untuk memperbaiki masalah ini."}
          </motion.p>
        </div>

        <Button
          onDoubleClick={() => {
            if (isQrInvalid) setInvalidQr(false);
            else participantAttend.reset();
          }}
        >
          <motion.div
            initial={{ rotate: -95 }}
            animate={{ rotate: 0 }}
            transition={{
              type: "spring",
              delay: 0.4,
            }}
            className="mr-2"
          >
            <RotateCcw className="h-4 w-4" />
          </motion.div>
          Coba Lagi
        </Button>
      </div>
    );

  return <MainScanner mutateData={mutateData} setInvalidQr={setIsQrValid} />;
}

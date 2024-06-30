import { useCallback, useState } from "react";
import { api } from "@/utils/api";
import { successTimeoutAtom } from "@/utils/atom";
import { useAtomValue } from "jotai";
import { Loader, RotateCcw } from "lucide-react";

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
      <div className="flex h-screen w-screen flex-col items-center justify-center">
        <Loader
          size={78}
          strokeWidth={1.5}
          className="animate-pulse animate-spin"
        />

        <div>
          <h3 className="mt-8 scroll-m-20 text-3xl font-semibold tracking-tight">
            Mengirim Data Kehadiran...
          </h3>
          <p className="text-xl font-light leading-7">
            Mohon tunggu proses ini sampai selesai.
          </p>
        </div>
      </div>
    );

  if (participantAttend.isSuccess)
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 bg-green-600 p-6">
        <div className="w-[80%] text-center">
          <h1 className="scroll-m-20 font-mono text-4xl font-extrabold tracking-tight text-red-100 lg:text-5xl">
            Berhasil Mengisi Kehadiran!
          </h1>
          <p className="text-center text-xl leading-7 text-red-100/90 [&:not(:first-child)]:mt-4">
            Silahkan menuju ke komputer pemilihan dan gunakan hak suara anda.
          </p>
        </div>
        <Separator className="w-[60%]" />
        <div className="flex gap-3">
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
          <Separator orientation="vertical" />
          <div>
            <p className="text-lg">{participantAttend.data.name}</p>
            <span className="font-mono">{participantAttend.data.subpart}</span>
          </div>
        </div>
      </div>
    );

  if (isQrInvalid || participantAttend.isError)
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-5 bg-red-600 p-6">
        <div className="w-[80%] text-center">
          <h1 className="scroll-m-20 font-mono text-4xl font-extrabold tracking-tight text-red-100 lg:text-5xl">
            Gagal Mengisi Kehadiran
          </h1>
          <p className="text-center text-xl leading-7 text-red-100 [&:not(:first-child)]:mt-6">
            {participantAttend.isError
              ? participantAttend.error.message
              : "QR Code yang anda tunjukkan tidak valid. Beritahu panitia untuk memperbaiki masalah ini."}
          </p>
        </div>

        <Button
          onDoubleClick={() => {
            if (isQrInvalid) setInvalidQr(false);
            else participantAttend.reset();
          }}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Coba Lagi
        </Button>
      </div>
    );

  return <MainScanner mutateData={mutateData} setInvalidQr={setIsQrValid} />;
}

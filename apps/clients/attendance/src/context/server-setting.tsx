import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/utils/api";
import { motion } from "framer-motion";
import { Loader, RotateCcw } from "lucide-react";

import { Button } from "@sora-vp/ui/button";
import { toast } from "@sora-vp/ui/toast";

interface ISettingContext {
  canAttend: boolean;
}

export const ServerSettingContext = createContext<ISettingContext>(
  {} as ISettingContext,
);

export const ServerSettingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [errorMessage, setErrorMessage] = useState("");

  const settingsQuery = api.clientConsumer.settings.useQuery(undefined, {
    refetchInterval: 2500,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (settingsQuery.error) setErrorMessage(settingsQuery.error.message);
  }, [settingsQuery.error]);

  const propsValue = useMemo(() => {
    if (!settingsQuery.data)
      return {
        canAttend: false,
      };

    const result = settingsQuery.data;

    const waktuMulai = result.startTime ? result.startTime.getTime() : null;
    const waktuSelesai = result.endTime ? result.endTime.getTime() : null;

    const currentTime = new Date().getTime();

    const canAttend =
      (waktuMulai as number) <= currentTime &&
      (waktuSelesai as number) >= currentTime &&
      result.canAttend;

    return {
      canAttend,
    };
  }, [settingsQuery.data]);

  if (settingsQuery.errorUpdateCount > 0)
    return (
      <>
        <div className="flex h-screen w-screen flex-col items-center justify-center gap-5 p-6">
          <div className="w-[80%] text-center">
            <motion.h1
              initial={{ opacity: 0, y: -25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -25 }}
              transition={{
                duration: 0.3,
              }}
              className="scroll-m-20 font-mono text-4xl font-extrabold tracking-tight text-red-600 lg:text-5xl"
            >
              Terjadi Sebuah Kesalahan
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -25 }}
              transition={{
                duration: 0.3,
                delay: 0.2,
              }}
              className="text-center text-xl leading-7 [&:not(:first-child)]:mt-6"
            >
              Tidak dapat mengambil data pengaturan ke server. Pastikan koneksi
              perangkat ini sudah terhubung dengan jaringan lokal. Hubungi
              pengendali server utama dan beritakan masalah ini.
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
            className="flex flex-col items-center"
          >
            <p>Pesan Error:</p>
            <pre className="w-full border p-2 font-mono">{errorMessage}</pre>
          </motion.div>

          <Button onDoubleClick={() => location.reload()}>
            <motion.div
              initial={{ rotate: -95 }}
              animate={{ rotate: 0 }}
              transition={{
                type: "spring",
                delay: 0.7,
              }}
              className="mr-2"
            >
              <RotateCcw className="h-4 w-4" />
            </motion.div>
            Muat Ulang
          </Button>
        </div>
        <div className="absolute bottom-4 left-4">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.8,
            }}
            className="font-sundanese select-none text-2xl"
            onDoubleClick={() => location.reload()}
          >
            ᮞᮧᮛ
          </motion.span>
        </div>
        <div className="absolute bottom-4 right-4">
          <small className="font-sundanese font-mono">v{APP_VERSION}</small>
        </div>
      </>
    );

  if (settingsQuery.isLoading)
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex h-screen w-screen flex-col items-center justify-center gap-5"
        >
          <h1
            className="font-sundanese select-none scroll-m-20 text-7xl font-medium tracking-tight lg:text-8xl"
            onDoubleClick={() => location.reload()}
          >
            ᮞᮧᮛ
          </h1>

          <Loader
            size={58}
            absoluteStrokeWidth
            className="animate-pulse animate-spin"
          />
        </motion.div>
        <div className="absolute bottom-4 right-4">
          <small className="font-sundanese font-mono">v{APP_VERSION}</small>
        </div>
      </>
    );

  return (
    <ServerSettingContext.Provider value={propsValue}>
      {children}
      <div className="absolute bottom-4 left-4">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="font-sundanese cursor-pointer select-none text-2xl"
          onDoubleClick={() => location.reload()}
        >
          ᮞᮧᮛ
        </motion.span>
      </div>
      <div className="absolute bottom-4 right-4">
        <small className="font-sundanese font-mono">v{APP_VERSION}</small>
      </div>
    </ServerSettingContext.Provider>
  );
};

export const useServerSetting = () =>
  useContext(ServerSettingContext) as ISettingContext;

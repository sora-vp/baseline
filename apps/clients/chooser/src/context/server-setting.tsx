import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { UniversalError } from "@/components/universal-error";
import { api } from "@/utils/api";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";

import { useParticipant } from "./participant-context";

interface ISettingContext {
  canVote: boolean;
}

export const ServerSettingContext = createContext<ISettingContext>(
  {} as ISettingContext,
);

export const ServerSettingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { qrId, setQRCode } = useParticipant();

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
        canVote: false,
      };

    const result = settingsQuery.data;

    const waktuMulai = result.startTime ? result.startTime.getTime() : null;
    const waktuSelesai = result.endTime ? result.endTime.getTime() : null;

    const currentTime = new Date().getTime();

    const canVote =
      (waktuMulai as number) <= currentTime &&
      (waktuSelesai as number) >= currentTime &&
      result.canVote;

    if (!canVote && qrId) setQRCode(null);

    return {
      canVote,
    };
  }, [settingsQuery.data]);

  if (settingsQuery.errorUpdateCount > 0)
    return (
      <>
        <UniversalError
          title="Terjadi Sebuah Kesalahan"
          description="Tidak dapat mengambil data pengaturan ke server. Pastikan koneksi perangkat ini sudah terhubung dengan jaringan lokal. Hubungi pengendali server utama dan beritakan masalah ini."
          errorMessage={errorMessage}
        />
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
        <div className="absolute bottom-1 right-1">
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

          <Loader size={58} absoluteStrokeWidth className="animate-spin" />
        </motion.div>
        <div className="absolute bottom-1 right-1">
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
      <div className="absolute bottom-1 right-1">
        <small className="font-sundanese font-mono">v{APP_VERSION}</small>
      </div>
    </ServerSettingContext.Provider>
  );
};

export const useServerSetting = () =>
  useContext(ServerSettingContext) as ISettingContext;

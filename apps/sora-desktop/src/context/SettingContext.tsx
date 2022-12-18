import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useToast } from "@chakra-ui/react";
import { DateTime } from "luxon";

import { soraTRPC, type SoraRouterOutput } from "@/utils/trpc";

interface ISettingContext {
  canVoteNow: boolean;
  isLoading: boolean;
  isError: boolean;
  isCandidatesExist: boolean;
  paslon: SoraRouterOutput["paslon"]["candidateList"] | undefined;
}

export const SettingContext = createContext<ISettingContext>(
  {} as ISettingContext
);

let intervalID: NodeJS.Timeout;

export const SettingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const toast = useToast();

  const [canVote, setCanVote] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(new Date().getTime());

  const [waktuMulai, setWaktuMulai] = useState<number | null>(null);
  const [waktuSelesai, setWaktuSelesai] = useState<number | null>(null);

  const paslonQuery = soraTRPC.paslon.candidateList.useQuery(undefined, {
    refetchOnWindowFocus: false,

    onError(error: {name: string, message: string}) {
      toast({
        description: `Error | ${error.name}: ${error.message}`,
        status: "error",
        duration: 5000,
        position: "top-right",
      });
    },
  });

  const settingsQuery = soraTRPC.settings.getSettings.useQuery(undefined, {
    refetchInterval: 2500,
    refetchIntervalInBackground: true,

    onSuccess(result) {
      setWaktuMulai(
        result.startTime
          ? DateTime.fromISO(result.startTime as unknown as string)
              .toLocal()
              .toJSDate()
              .getTime()
          : null
      );
      setWaktuSelesai(
        result.endTime
          ? DateTime.fromISO(result.endTime as unknown as string)
              .toLocal()
              .toJSDate()
              .getTime()
          : null
      );
      setCanVote(result.canVote);
    },

    onError(error: {name: string, message: string}) {
      toast({
        description: `Error | ${error.name}: ${error.message}`,
        status: "error",
        duration: 5000,
        position: "top-right",
      });
    },
  });

  const canVoteNow = useMemo(
    () =>
      (waktuMulai as number) <= currentTime &&
      (waktuSelesai as number) >= currentTime &&
      canVote,
    [waktuMulai, waktuSelesai, currentTime, canVote]
  );

  const isCandidatesExist = useMemo(
    () => (paslonQuery.data && paslonQuery.data.length > 1) || false,
    [paslonQuery.data]
  );

  const isLoading = useMemo(
    () => paslonQuery.isLoading || settingsQuery.isLoading,
    [paslonQuery.isLoading, settingsQuery.isLoading]
  );

  const isError = useMemo(() => paslonQuery.isError || settingsQuery.isError, [paslonQuery.isError, settingsQuery.isError]);

  useEffect(() => {
    function updateTime() {
      setCurrentTime(new Date().getTime());
    }
    updateTime();

    intervalID = setInterval(updateTime, 5_000);

    return () => {
      clearInterval(intervalID);
    };
  }, []);

  return (
    <SettingContext.Provider
      value={{
        canVoteNow,
        isLoading,
        isError,
        isCandidatesExist,
        paslon: paslonQuery.data,
      }}
    >
      {children}
    </SettingContext.Provider>
  );
};

export const useSetting = () => useContext(SettingContext) as ISettingContext;

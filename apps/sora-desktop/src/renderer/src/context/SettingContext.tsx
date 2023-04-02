import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useToast } from "@chakra-ui/react";
import { DateTime } from "luxon";

import { trpc, type RouterOutput } from "@renderer/utils/trpc";

interface ISettingContext {
  canVoteNow: boolean;
  isLoading: boolean;
  isError: boolean;
  isCandidatesExist: boolean;
  candidates: RouterOutput["candidate"]["candidateList"] | undefined;
}

export const SettingContext = createContext<ISettingContext>(
  {} as ISettingContext
);

let intervalID: NodeJS.Timeout;

export const SettingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const toast = useToast();

  const [canVote, setCanVote] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(new Date().getTime());

  const [waktuMulai, setWaktuMulai] = useState<number | null>(null);
  const [waktuSelesai, setWaktuSelesai] = useState<number | null>(null);

  const candidateQuery = trpc.candidate.candidateList.useQuery(undefined, {
    refetchOnWindowFocus: false,

    onError(error) {
      toast({
        description: `Error: ${error.message}`,
        status: "error",
        duration: 5000,
        position: "top-right",
      });
    },
  });

  const settingsQuery = trpc.settings.getSettings.useQuery(undefined, {
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

      if (candidateQuery.isError) candidateQuery.refetch();
    },

    onError(error) {
      toast({
        description: `Error: ${error.message}`,
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
    () => (candidateQuery.data && candidateQuery.data.length > 1) || false,
    [candidateQuery.data]
  );

  const isLoading = useMemo(
    () => candidateQuery.isLoading || settingsQuery.isLoading,
    [candidateQuery.isLoading, settingsQuery.isLoading]
  );

  const isError = useMemo(
    () => candidateQuery.isError || settingsQuery.isError,
    [candidateQuery.isError, settingsQuery.isError]
  );

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
        candidates: candidateQuery.data,
      }}
    >
      {children}
    </SettingContext.Provider>
  );
};

export const useSetting = () => useContext(SettingContext) as ISettingContext;

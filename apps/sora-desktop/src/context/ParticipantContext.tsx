import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useToast } from "@chakra-ui/react";
import { Navigate } from "react-router-dom";

import Loading from "@/components/PreScan/Loading";
import { trpc } from "@/utils/trpc";

interface IParticipantContext {
  qrId: string | null;
  setQRCode: (qr: string | null) => void;
}

export const ParticipantContext = createContext<IParticipantContext>(
  {} as IParticipantContext
);

export const ParticipantProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [qrId, setQrId] = useState<string | null>(null);

  const setQRCode = useCallback((qr: string | null) => setQrId(qr), []);

  const propsValue = useMemo(
    () => ({
      qrId,
      setQRCode,
    }),
    [qrId]
  );

  return (
    <ParticipantContext.Provider value={propsValue}>
      {children}
    </ParticipantContext.Provider>
  );
};

export const useParticipant = () =>
  useContext(ParticipantContext) as IParticipantContext;

export const ensureParticipantIsValidVoter = (Element: React.FC) => () => {
  const toast = useToast();
  const { qrId } = useParticipant();

  const participantStatus =
    trpc.absensi.participant.getParticipantStatus.useQuery(qrId as string, {
      onSuccess(result) {
        if (!result.sudahAbsen) {
          toast({
            description: "Kamu belum absen!",
            status: "error",
            duration: 8_000,
            position: "top-right",
            isClosable: false,
          });
        } else if (result.sudahMemilih) {
          toast({
            description: "Kamu sudah memilih kandidat!",
            status: "error",
            duration: 8_000,
            position: "top-right",
            isClosable: false,
          });
        }
      },
      refetchInterval: 2500,
    });

  if (!qrId) return <Navigate to="/" />;

  if (participantStatus.isLoading) return <Loading />;

  if (
    !participantStatus.isLoading &&
    participantStatus.data &&
    !participantStatus.data.sudahAbsen
  )
    return <Navigate to="/" />;

  if (
    !participantStatus.isLoading &&
    participantStatus.data &&
    participantStatus.data.sudahMemilih
  )
    return <Navigate to="/" />;

  return <Element />;
};

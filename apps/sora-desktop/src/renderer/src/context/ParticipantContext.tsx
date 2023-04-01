import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useToast } from "@chakra-ui/react";
import { Navigate } from "react-router-dom";

import Loading from "@renderer/components/PreScan/Loading";
import { trpc } from "@renderer/utils/trpc";

interface IParticipantContext {
  qrId: string | null;
  setQRCode: (qr: string | null) => void;
}

export const ParticipantContext = createContext<IParticipantContext>(
  {} as IParticipantContext
);

export const ParticipantProvider = ({
  children,
}: {
  children: React.ReactNode;
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

// eslint-disable-next-line react/display-name
export const ensureParticipantIsValidVoter = (Element: React.FC) => () => {
  const { qrId } = useParticipant();

  if (!qrId) return <Navigate to="/" />;

  return (
    <EnsureChild qrId={qrId}>
      <Element />
    </EnsureChild>
  );
};

const EnsureChild = ({
  qrId,
  children,
}: {
  children: React.ReactNode;
  qrId: string;
}) => {
  const toast = useToast();

  const participantStatus = trpc.participant.getParticipantStatus.useQuery(
    qrId as string,
    {
      onSuccess(result) {
        if (!result.alreadyAttended) {
          toast({
            description: "Kamu belum absen!",
            status: "error",
            duration: 8_000,
            position: "top-right",
            isClosable: false,
          });
        } else if (result.alreadyChoosing) {
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
    }
  );

  if (participantStatus.isLoading) return <Loading />;

  if (
    !participantStatus.isLoading &&
    participantStatus.data &&
    !participantStatus.data.alreadyAttended
  )
    return <Navigate to="/" />;

  if (
    !participantStatus.isLoading &&
    participantStatus.data &&
    participantStatus.data.alreadyChoosing
  )
    return <Navigate to="/" />;

  return <>{children}</>;
};

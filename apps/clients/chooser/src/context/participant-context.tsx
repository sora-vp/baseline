import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { api } from "@/utils/api";
import { Navigate } from "react-router-dom";

export interface IParticipantContext {
  qrId: string | null;
  setQRCode: (qr: string | null) => void;
}

export const ParticipantContext = createContext<IParticipantContext>(
  {} as IParticipantContext,
);

export const ParticipantProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [qrId, setQrId] = useState<string | null>(null);

  const participantQuery = api.clientConsumer.getParticipantStatus.useQuery(
    qrId as string,
    {
      refetchInterval: 2500,
      enabled: !!qrId,
    },
  );

  const setQRCode = useCallback((qr: string | null) => setQrId(qr), []);

  const propsValue = useMemo(() => {
    if (!qrId)
      return {
        name: null,
        subpart: null,
        isFetched: null,
        alreadyAttended: null,
        alreadyChoosing: null,
        qrId,
        setQRCode,
      };

    return {
      name: participantQuery.data?.name,
      subpart: participantQuery.data?.subpart,
      isFetched: participantQuery.isFetched,
      alreadyAttended: participantQuery.data?.alreadyAttended,
      alreadyChoosing: participantQuery.data?.alreadyChoosing,
      qrId,
      setQRCode,
    };
  }, [qrId]);

  return (
    <ParticipantContext.Provider value={propsValue}>
      {children}
    </ParticipantContext.Provider>
  );
};

export const useParticipant = () =>
  useContext(ParticipantContext) as IParticipantContext;

// eslint-disable-next-line react/display-name
export const ensureQRIDExist = (Element: React.FC) => () => {
  const { qrId } = useParticipant();

  if (!qrId) return <Navigate to="/" replace />;

  return <Element />;
};

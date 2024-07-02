import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { UniversalError } from "@/components/universal-error";
import { api } from "@/utils/api";
import { motion } from "framer-motion";
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
  const [votedSuccessfully, setVoted] = useState(false);

  const participantQuery = api.clientConsumer.getParticipantStatus.useQuery(
    qrId as string,
    {
      refetchInterval: 2500,
      enabled: !!qrId && !votedSuccessfully,
    },
  );

  const setQRCode = useCallback((qr: string | null) => setQrId(qr), []);
  const setVotedSuccessfully = useCallback(
    (success: boolean) => setVoted(success),
    [],
  );

  const propsValue = useMemo(() => {
    if (!qrId)
      return {
        name: null,
        subpart: null,
        qrId,
        setQRCode,
        setVotedSuccessfully,
      };

    return {
      name: participantQuery.data?.name ?? null,
      subpart: participantQuery.data?.subpart ?? null,
      qrId,
      setQRCode,
      setVotedSuccessfully,
    };
  }, [qrId, participantQuery.data]);

  if (
    !!qrId &&
    participantQuery.isFetched &&
    !participantQuery.data?.alreadyAttended
  )
    return (
      <>
        <UniversalError
          title="Gagal Memilih!"
          description="Anda belum absen!"
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
        <div className="absolute bottom-4 right-4">
          <small className="font-sundanese font-mono">v{APP_VERSION}</small>
        </div>
      </>
    );

  if (
    !!qrId &&
    participantQuery.isFetched &&
    participantQuery.data?.alreadyChoosing
  )
    return (
      <>
        <UniversalError
          title="Gagal Memilih!"
          description="Anda sudah memilih!"
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
        <div className="absolute bottom-4 right-4">
          <small className="font-sundanese font-mono">v{APP_VERSION}</small>
        </div>
      </>
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
export const ensureQRIDExist = (Element: React.FC) => () => {
  const { qrId } = useParticipant();

  if (!qrId) return <Navigate to="/" replace />;

  return <Element />;
};

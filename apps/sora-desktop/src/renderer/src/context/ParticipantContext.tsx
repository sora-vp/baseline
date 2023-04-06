import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";
import { Navigate } from "react-router-dom"

export interface IParticipantContext {
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
export const justEnsureQrIDExist = (Element: React.FC) => () => {
  const { qrId } = useParticipant();

  if (!qrId) return <Navigate to="/" replace />;

  return (
    <Element />
  );
};
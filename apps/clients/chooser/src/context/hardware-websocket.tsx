import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { defaultWSPortAtom, enableWSConnectionAtom } from "@/utils/atom";
import { useAtomValue } from "jotai";
import useWebSocket, { ReadyState } from "react-use-websocket";

import { toast } from "@sora-vp/ui/toast";

export type THardwareWebsocketCallback = (message: string) => void;

export interface IHardwareWebsocket {
  wsEnabled: boolean;
  subscribe(callbacK: THardwareWebsocketCallback): () => void;
}

export const HardwareWebsocketContext = createContext<IHardwareWebsocket>(
  {} as IHardwareWebsocket,
);

export const HardwareWebsocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const currentSubscriberIdRef = useRef<number>(0);
  const subscribersRef = useRef<Map<number, THardwareWebsocketCallback>>(
    new Map(),
  );

  const wsPortNumber = useAtomValue(defaultWSPortAtom);
  const wsEnabled = useAtomValue(enableWSConnectionAtom);

  const { lastMessage, readyState } = useWebSocket<string>(
    wsEnabled ? `ws://127.0.0.1:${wsPortNumber}/ws` : null,
    {
      share: true,
      shouldReconnect: () => true,
      retryOnError: true,
      reconnectInterval: 5000,
      reconnectAttempts: Infinity,
      onError(event) {
        console.log(event);
      },
    },
  );

  const subscribe = useCallback((callback: THardwareWebsocketCallback) => {
    const id = currentSubscriberIdRef.current;
    subscribersRef.current.set(id, callback);
    currentSubscriberIdRef.current++;

    return () => {
      subscribersRef.current.delete(id);
    };
  }, []);

  useEffect(() => {
    if (lastMessage) {
      Array.from(subscribersRef.current).forEach(([, callback]) => {
        callback(lastMessage.data);
      });
    }
  }, [lastMessage]);

  useEffect(() => {
    if (wsEnabled) {
      switch (readyState) {
        case ReadyState.CONNECTING: {
          toast.info("Sedang menghubungkan dengan modul tombol...");

          break;
        }

        case ReadyState.CLOSED: {
          toast.error("Koneksi ditutup oleh modul tombol");

          break;
        }

        case ReadyState.CLOSING: {
          toast.info("Menutup koneksi tombol...");

          break;
        }

        case ReadyState.OPEN: {
          toast.success("Berhasil terhubung ke modul tombol!");

          break;
        }
      }
    }
  }, [readyState, wsEnabled]);

  return (
    <HardwareWebsocketContext.Provider
      value={{
        wsEnabled,
        subscribe,
      }}
    >
      {children}
    </HardwareWebsocketContext.Provider>
  );
};

export const useHardwareWebsocket = () =>
  useContext(HardwareWebsocketContext) as IHardwareWebsocket;

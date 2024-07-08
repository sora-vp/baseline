import { createContext, useContext, useEffect, useMemo } from "react";
import { defaultWSPortAtom, enableWSConnectionAtom } from "@/utils/atom";
import { useAtomValue } from "jotai";
import useWebSocket, { ReadyState } from "react-use-websocket";

import { toast } from "@sora-vp/ui/toast";

export interface IKeyboardWebsocket {
  wsEnabled: boolean;
  lastMessage: MessageEvent<string> | null;
}

export const KeyboardWebsocketContext = createContext<IKeyboardWebsocket>(
  {} as IKeyboardWebsocket,
);

export const KeyboardWebsocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
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

  const contextValue = useMemo(
    () => ({
      wsEnabled,
      lastMessage,
    }),
    [wsEnabled, lastMessage],
  );

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
    <KeyboardWebsocketContext.Provider value={contextValue}>
      {children}
    </KeyboardWebsocketContext.Provider>
  );
};

export const useKeyboardWebsocket = () =>
  useContext(KeyboardWebsocketContext) as IKeyboardWebsocket;

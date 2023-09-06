import { useEffect } from "react";
import { useToast } from "@chakra-ui/react";

import { Setting } from "@sora/ui/Setting";

import { useStore } from "@sora/"

export const AppSettingGuard = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const toast = useToast();

  useEffect(() => {
    const composeAsync = async () => {
      const storeValue = await window.electron.ipcRenderer.invoke(
        "get-server-url",
      );

      // setServerUrlState(storeValue);
    };

    composeAsync();
  }, []);

  if (!serverURL) return <Setting ipcRenderer={window.electron.ipcRenderer} />;

  return <>{children}</>;
};

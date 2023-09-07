import { useEffect } from "react";
import { useToast } from "@chakra-ui/react";

import { useStore } from "@sora/desktop-settings";
import { Setting } from "@sora/ui/Setting";

export const AppSettingGuard = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const toast = useToast();

  const serverURL = useStore((store) => store.trpcLink);
  const changeURL = useStore((store) => store.updateLink);

  useEffect(() => {
    const composeAsync = async () => {
      const storeValue = await window.electron.ipcRenderer.invoke(
        "get-server-url",
      );

      changeURL(storeValue, window.electron.ipcRenderer);
    };

    composeAsync();
  }, []);

  if (!serverURL || serverURL === "" || !serverURL.startsWith("http"))
    return <Setting ipcRenderer={window.electron.ipcRenderer} />;

  return <>{children}</>;
};

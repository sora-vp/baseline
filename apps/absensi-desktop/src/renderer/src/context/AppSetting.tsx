import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useToast } from "@chakra-ui/react";

import Setting from "@renderer/routes/Setting";

interface IAppSetting {
  serverURL?: string;
  setServerUrl: (url: string) => void;
}

export const AppSettingContext = createContext<IAppSetting>({} as IAppSetting);

export const AppSettingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const toast = useToast();

  const [serverURL, setServerUrlState] = useState<string | undefined>();

  const setServerUrl = useCallback(async (url: string) => {
    try {
      const serverURL = new URL(url);

      await window.electron.ipcRenderer.invoke(
        "set-server-url",
        serverURL.origin
      );

      toast({
        description: "Berhasil memperbarui pengaturan alamat server!",
        status: "success",
        duration: 4500,
        position: "top-right",
      });

      setTimeout(() => {
        location.href = "#/";
      }, 3000);
    } catch (error: any) {
      toast({
        description: `Gagal memperbarui url | ${error.message}`,
        status: "error",
        duration: 5000,
        position: "top-right",
      });
    }
  }, []);

  useEffect(() => {
    const composeAsync = async () => {
      const storeValue = await window.electron.ipcRenderer.invoke(
        "get-server-url"
      );

      setServerUrlState(storeValue);
    };

    composeAsync();
  }, []);

  const valueProps = useMemo(() => ({ serverURL, setServerUrl }), [serverURL]);

  return (
    <AppSettingContext.Provider value={valueProps}>
      {children}
    </AppSettingContext.Provider>
  );
};

export const useAppSetting = () => useContext(AppSettingContext) as IAppSetting;

export const ensureHasAppSetting = (Element: React.FC) => () => {
  const { serverURL } = useAppSetting();

  if (!serverURL) return <Setting />;

  return <Element />;
};

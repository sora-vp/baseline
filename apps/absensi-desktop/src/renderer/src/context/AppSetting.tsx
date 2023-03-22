import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from "react";
// import Store from "electron-store";
import { useToast } from "@chakra-ui/react";

import Setting from "@renderer/routes/Setting";
interface IAppSetting {
  serverURL?: string;
  setServerUrl: (url: string) => void;
}

// const store = new Store<Omit<IAppSetting, "setServerUrl">>();

export const AppSettingContext = createContext<IAppSetting>({} as IAppSetting);

export const AppSettingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const toast = useToast();

  const [serverURL] = useState<string | undefined>("http://localhost:3000");

  const setServerUrl = useCallback((url: string) => {
    try {
      const serverURL = new URL(url);

      // store.set("serverURL", serverURL.origin);

      toast({
        description: "Berhasil memperbarui pengaturan alamat server!",
        status: "success",
        duration: 4500,
        position: "top-right",
      });

      setTimeout(() => location.reload(), 3000);
    } catch (error: any) {
      toast({
        description: `Gagal memperbarui url | ${error.message}`,
        status: "error",
        duration: 5000,
        position: "top-right",
      });
    }
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
  // if (!store.get("serverURL")) return <Setting />;

  return <Element />;
};

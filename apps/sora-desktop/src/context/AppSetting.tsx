import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from "react";
import Store from "electron-store";
import { useToast } from "@chakra-ui/react";

interface IAppSetting {
  serverURL?: string;
}

const store = new Store<IAppSetting>();

export const AppSettingContext = createContext<IAppSetting>({} as IAppSetting);

export const AppSettingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const toast = useToast();

  const [serverURL] = useState<string | undefined>(store.get("serverURL"));

  const setServerUrl = useCallback((newUrl: string) => {
    try {
      const url = new URL(newUrl);

      store.set('serverURL', url.origin)
    } catch (error: any) {
      toast({
        description: `Error dalam memperbarui url | ${error.message}`,
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

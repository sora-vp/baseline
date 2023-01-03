import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from "react";
import Store from "electron-store";
import { useToast } from "@chakra-ui/react";

import Setting from "@/routes/Setting";
interface IAppSetting {
  soraURL?: string;
  absensiURL?: string;
  setServerUrl: ({ sora, absensi }: { sora: string; absensi: string }) => void;
}

const store = new Store<Omit<IAppSetting, "setServerUrl">>();

export const AppSettingContext = createContext<IAppSetting>({} as IAppSetting);

export const AppSettingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const toast = useToast();

  const [soraURL] = useState<string | undefined>(store.get("soraURL"));
  const [absensiURL] = useState<string | undefined>(store.get("absensiURL"));

  const setServerUrl = useCallback(
    ({ sora, absensi }: { sora: string; absensi: string }) => {
      try {
        const soraURL = new URL(sora);
        const absensiURL = new URL(absensi);

        store.set("soraURL", soraURL.origin);
        store.set("absensiURL", absensiURL.origin);

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
    },
    []
  );

  const valueProps = useMemo(
    () => ({ soraURL, absensiURL, setServerUrl }),
    [soraURL, absensiURL]
  );

  return (
    <AppSettingContext.Provider value={valueProps}>
      {children}
    </AppSettingContext.Provider>
  );
};

export const useAppSetting = () => useContext(AppSettingContext) as IAppSetting;

export const ensureHasAppSetting = (Element: React.FC) => () => {
  if (!store.get("soraURL") || !store.get("absensiURL")) return <Setting />;

  return <Element />;
};

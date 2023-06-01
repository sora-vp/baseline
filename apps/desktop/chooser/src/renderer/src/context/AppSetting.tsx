import { createContext, useContext, useEffect, useMemo, useState } from "react";
import Setting from "@renderer/routes/Setting";

interface IAppSetting {
  serverURL?: string;
}

export const AppSettingContext = createContext<IAppSetting>({} as IAppSetting);

export const AppSettingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [serverURL, setServerUrlState] = useState<string | undefined>();

  useEffect(() => {
    const composeAsync = async () => {
      const storeValue = await window.electron.ipcRenderer.invoke(
        "get-server-url",
      );

      setServerUrlState(storeValue);
    };

    composeAsync();
  }, []);

  const valueProps = useMemo(() => ({ serverURL }), [serverURL]);

  return (
    <AppSettingContext.Provider value={valueProps}>
      {children}
    </AppSettingContext.Provider>
  );
};

export const useAppSetting = () => useContext(AppSettingContext) as IAppSetting;

// eslint-disable-next-line react/display-name
export const ensureHasAppSetting = (Element: React.FC) => () => {
  const { serverURL } = useAppSetting();

  if (!serverURL) return <Setting />;

  return <Element />;
};

import { useEffect, useState } from "react";
import {
  ensureHasAppSetting,
  useAppSetting,
} from "@renderer/context/AppSetting";
import { ParticipantProvider } from "@renderer/context/ParticipantContext";
import { SettingProvider } from "@renderer/context/SettingContext";
import { trpc } from "@renderer/utils/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { RouterProvider, createHashRouter } from "react-router-dom";
import superjson from "superjson";

import { Setting } from "@sora/ui/Setting";

import Main from "./routes/Main";
import Vote from "./routes/Vote";

const router = createHashRouter([
  {
    path: "/",
    element: <Main />,
  },
  {
    path: "/vote",
    element: <Vote />,
  },
  {
    path: "/setting",
    element: <Setting ipcRenderer={window.electron.ipcRenderer} />,
  },
]);

const App: React.FC = () => {
  const { serverURL } = useAppSetting();

  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer: superjson,
      links: [
        httpBatchLink({
          url: `${serverURL as string}/api/trpc`,
        }),
      ],
    }),
  );

  useEffect(() => {
    const openSetting = () => {
      location.href = "#/setting";
    };

    window.electron.ipcRenderer.on("open-setting", openSetting);

    return () => {
      window.electron.ipcRenderer.removeListener("open-setting", openSetting);
    };
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ParticipantProvider>
          <SettingProvider>
            <RouterProvider router={router} />
          </SettingProvider>
        </ParticipantProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
};

export default ensureHasAppSetting(App);

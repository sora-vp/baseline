import { useState } from "react";

import superjson from "superjson";
import { httpBatchLink } from "@trpc/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { trpc } from "@renderer/utils/trpc";
import { SettingProvider } from "@renderer/context/SettingContext";
import {
  useAppSetting,
  ensureHasAppSetting,
} from "@renderer/context/AppSetting";

import Main from "./routes/Main";
import Setting from "./routes/Setting";

const router = createHashRouter([
  {
    path: "/",
    element: <Main />,
  },
  {
    path: "/setting",
    element: <Setting />,
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
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <SettingProvider>
          <RouterProvider router={router} />
        </SettingProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
};

export default ensureHasAppSetting(App);

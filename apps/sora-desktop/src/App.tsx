import { useState } from "react";

import superjson from "superjson";
import { httpBatchLink } from "@trpc/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { soraTRPC, absensiTRPC } from "@/utils/trpc";
import { SettingProvider } from "@/context/SettingContext";
import { useAppSetting, ensureHasAppSetting } from "@/context/AppSetting";

import Main from "./routes/Main";
import Vote from "./routes/Vote";
import Setting from "./routes/Setting";

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
    element: <Setting />,
  },
]);

const App: React.FC = () => {
  const { soraURL, absensiURL } = useAppSetting();

  const [soraQueryClient] = useState(() => new QueryClient());
  const [soraTRPCClient] = useState(() =>
    soraTRPC.createClient({
      transformer: superjson,
      links: [
        httpBatchLink({
          url: `${soraURL as string}/api/trpc`,
        }),
      ],
    })
  );

  const [absensiQueryClient] = useState(() => new QueryClient());
  const [absensiTRPCClient] = useState(() =>
    absensiTRPC.createClient({
      transformer: superjson,
      links: [
        httpBatchLink({
          url: `${absensiURL as string}/api/trpc`,
        }),
      ],
    })
  );

  return (
    <soraTRPC.Provider client={soraTRPCClient} queryClient={soraQueryClient}>
      <QueryClientProvider client={soraQueryClient}>
        <absensiTRPC.Provider
          client={absensiTRPCClient}
          queryClient={absensiQueryClient}
        >
          <QueryClientProvider client={absensiQueryClient}>
            <SettingProvider>
              <RouterProvider router={router} />
            </SettingProvider>
          </QueryClientProvider>
        </absensiTRPC.Provider>
      </QueryClientProvider>
    </soraTRPC.Provider>
  );
};

export default ensureHasAppSetting(App);

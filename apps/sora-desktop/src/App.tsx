import { useState } from "react";

import superjson from "superjson";
import { httpBatchLink } from "@trpc/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { trpc } from "@/utils/trpc";
import { SettingProvider } from "@/context/SettingContext";
import { ParticipantProvider } from "@/context/ParticipantContext";
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

  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer: superjson,
      links: [
        (runtime) => {
          const servers = {
            sora: httpBatchLink({ url: `${soraURL as string}/api/trpc` })(
              runtime
            ),
            absensi: httpBatchLink({ url: `${absensiURL as string}/api/trpc` })(
              runtime
            ),
          };
          return (ctx) => {
            const { op } = ctx;
            const pathParts = op.path.split(".");

            const serverName =
              pathParts.shift() as string as keyof typeof servers;

            const path = pathParts.join(".");

            const link = servers[serverName];

            return link({
              ...ctx,
              op: {
                ...op,
                path,
              },
            });
          };
        },
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <SettingProvider>
          <ParticipantProvider>
            <RouterProvider router={router} />
          </ParticipantProvider>
        </SettingProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
};

export default ensureHasAppSetting(App);

import { useState } from "react";

import superjson from "superjson";
import { httpBatchLink } from "@trpc/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { soraTRPC } from "@/utils/trpc";
import { useAppSetting } from "@/context/AppSetting";
import { SettingProvider } from "@/context/SettingContext";

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
]);

const ActualApp: React.FC = () => {
  const { serverURL } = useAppSetting();

  const [soraQueryClient] = useState(() => new QueryClient());
  const [soraTRPCClient] = useState(() =>
    soraTRPC.createClient({
      transformer: superjson,
      links: [
        httpBatchLink({
          url: `${serverURL as string}/api/trpc`,
        }),
      ],
    })
  );

  return (
    <soraTRPC.Provider client={soraTRPCClient} queryClient={soraQueryClient}>
      <QueryClientProvider client={soraQueryClient}>
        <SettingProvider>
          <RouterProvider router={router} />
        </SettingProvider>
      </QueryClientProvider>
    </soraTRPC.Provider>
  );
};

const App: React.FC = () => {
  const { serverURL } = useAppSetting();

  if (!serverURL) return <>SET DULU CUY</>;
  return <ActualApp />;
};

export default App;

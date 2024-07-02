import { useState } from "react";
import { ServerSettingProvider } from "@/context/server-setting";
import MainPage from "@/routes/main-page";
import { api } from "@/utils/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import superjson from "superjson";

import { env } from "./env";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainPage />,
  },
  {
    path: "about",
    element: <div>About</div>,
  },
]);

const getBaseUrl = () => {
  if (!env.VITE_IS_DOCKER && env.VITE_TRPC_URL) return env.VITE_TRPC_URL;

  if (import.meta.env.DEV && !env.VITE_IS_DOCKER && !env.VITE_TRPC_URL)
    return "http://localhost:3000/api/trpc";

  return "/api/trpc";
};

export default function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        httpBatchLink({
          url: getBaseUrl(),
          transformer: superjson,
        }),
      ],
    }),
  );

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ServerSettingProvider>
          <RouterProvider router={router} />
        </ServerSettingProvider>
      </QueryClientProvider>
    </api.Provider>
  );
}

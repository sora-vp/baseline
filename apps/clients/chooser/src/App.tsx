import { useEffect, useState } from "react";
import { ParticipantProvider } from "@/context/participant-context";
import { ServerSettingProvider } from "@/context/server-setting";
import MainPage from "@/routes/main-page";
import VotePage from "@/routes/vote-page";
import { api } from "@/utils/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import superjson from "superjson";

import { ClientNotFound } from "@sora-vp/ui/client-not-found";

import { HardwareWebsocketProvider } from "./context/hardware-websocket";
import { env } from "./env";

const router = createBrowserRouter([
  {
    path: "*",
    element: <ClientNotFound />,
  },
  {
    path: "/",
    element: <MainPage />,
  },
  {
    path: "vote",
    element: <VotePage />,
  },
  {
    path: "settings",
    lazy: async () => {
      const { SettingsPage } = await import("@/routes/setting-page");

      return { Component: SettingsPage };
    },
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

  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === ",") {
        e.preventDefault();

        router.navigate("/settings");
      }
    };

    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <HardwareWebsocketProvider>
          <ParticipantProvider>
            <ServerSettingProvider>
              <RouterProvider router={router} />
            </ServerSettingProvider>
          </ParticipantProvider>
        </HardwareWebsocketProvider>
      </QueryClientProvider>
    </api.Provider>
  );
}

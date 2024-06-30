import { useState } from "react";
import { ServerSettingProvider } from "@/context/server-setting";
import MainPage from "@/routes/main-page";
import { api } from "@/utils/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createBrowserRouter, Link, RouterProvider } from "react-router-dom";
import superjson from "superjson";

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
  if (import.meta.env.DEV) return "http://localhost:3000/api/trpc";

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

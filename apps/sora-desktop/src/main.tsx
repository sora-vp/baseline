import superjson from "superjson";
import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { httpBatchLink } from "@trpc/client";
import { ChakraProvider } from "@chakra-ui/react";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { soraTRPC } from "@/utils/trpc";
import { SettingProvider } from "@/context/SettingContext";

import Main from "./routes/Main";

const router = createHashRouter([
  {
    path: "/",
    element: <Main />,
  },
]);

const RenderedElement = () => {
  const [soraQueryClient] = useState(() => new QueryClient());
  const [soraTRPCClient] = useState(() =>
    soraTRPC.createClient({
      transformer: superjson,
      links: [
        httpBatchLink({
          url: "http://localhost:3000/api/trpc",
        }),
      ],
    })
  );

  return (
    <ChakraProvider>
      <soraTRPC.Provider client={soraTRPCClient} queryClient={soraQueryClient}>
        <QueryClientProvider client={soraQueryClient}>
          <SettingProvider>
            <RouterProvider router={router} />
          </SettingProvider>
        </QueryClientProvider>
      </soraTRPC.Provider>
    </ChakraProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root")!)

root.render(
  <React.StrictMode>
    <RenderedElement />
  </React.StrictMode>
);

postMessage({ payload: "removeLoading" }, "*");

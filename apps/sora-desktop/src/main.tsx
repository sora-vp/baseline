import "picnic";

import superjson from "superjson";
import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { httpBatchLink } from "@trpc/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { soraTRPC } from "@/utils/trpc";

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
    <soraTRPC.Provider client={soraTRPCClient} queryClient={soraQueryClient}>
      <QueryClientProvider client={soraQueryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </soraTRPC.Provider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RenderedElement />
  </React.StrictMode>
);

postMessage({ payload: "removeLoading" }, "*");

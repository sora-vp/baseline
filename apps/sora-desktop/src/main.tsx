import React, { lazy } from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";

const UpperProvider = lazy(() => import("./UpperProvider"));

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <ChakraProvider>
      <UpperProvider />
    </ChakraProvider>
  </React.StrictMode>
);

postMessage({ payload: "removeLoading" }, "*");

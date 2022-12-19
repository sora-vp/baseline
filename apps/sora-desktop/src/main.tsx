import React, { lazy } from "react";
import ReactDOM from "react-dom/client";

import { ChakraProvider } from "@chakra-ui/react";

const App = lazy(() => import("./App"));

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);

postMessage({ payload: "removeLoading" }, "*");
